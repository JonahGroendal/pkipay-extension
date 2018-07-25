/*
 BATify: https://www.batify.net/
 https://github.com/mikel2000/batify
 Copyright (C) 2018 Michael Volz (batifyext at gmail dot com)
 Licensed under the Mozilla Public License 2.0
 Please check ../LICENSE for licensing details
*/

/*
 Modified by Jonah Groendal
*/

const runtime = chrome.runtime || browser.runtime;
const tabs = chrome.tabs || browser.tabs;
const windows = chrome.windows || browser.windows;
const webNavigation = chrome.webNavigation || browser.webNavigation;
const storage = chrome.storage || browser.storage;
const browserAction = chrome.browserAction || browser.browserAction;

var bkg =
{
   config: null,

   init: function()
   {
      utils.getStorageData({config:
      {
         paymentStatus: true,
         budget: ledger.default_budget,
         autoInclude: true,
         showIncludedOnly: true,
         showActiveOnly: true,
         minViewDuration: ledger.default_min_view_duration,
         minViews: ledger.default_min_views,
         budgetCurrency: ledger.default_budget_currency,
         logLevel: utils.log_level_error
      }}).then(function(config)
      {
         bkg.config = config.config;
         return db.init();
      }).then(function()
      {
         return tabHandler.init();
      }).then(function()
      {
         runtime.onMessage.addListener(bkg.handleMessage);
         //return bkg.handleInstall();
      }).then(function()
      {
         utils.log("bkg.init finished", utils.log_level_debug);
      }).catch(function(e)
      {
         console.log("Batify: ERROR: init failed: " + e);
      });
   },

   handleMessage: function(request, sender, sendResponse)
   {
      utils.log("bkg.handleMessage: " + JSON.stringify(request), utils.log_level_debug);

      if(request.action == "getConfig")
      {
         sendResponse(bkg.config);
         return true;
      }
      else if(request.action == "getViews")
      {
         db.getViews(bkg.config.showIncludedOnly, bkg.config.showActiveOnly).then(function(views)
         {
            sendResponse(views);
         });

         return true;
      }
      else if(request.action == "getLastContribution")
      {
         db.getLastContribution().then(function(contribution)
         {
            if(contribution)
            {
               contribution.success = true;
               sendResponse(contribution);
            }
            else
            {
               sendResponse({success: false});
            }
         }).catch(function(e)
         {
            sendResponse({success: false});
         });

         return true;
      }
      else if(request.action == "storeView")
      {
         tabHandler.storeView(request.view, true).then(function()
         {
            sendResponse({success: true});
         }).catch(function(e)
         {
            sendResponse({success: false});
         });

         return true;
      }
   },

   sendMessage: function(action)
   {
      runtime.sendMessage({action: action}, function(response)
      {
         if(runtime.lastError)
         {
         }
      });
   }
}

var tabHandler =
{
   domain_internal: "internal",

   cache: [],
   active: null,
   windowId: null,

   init: function()
   {
      utils.log("tabHandler.init: start initializing...", utils.log_level_debug);
      windows.onFocusChanged.addListener(tabHandler.windowChanged);
      windows.onRemoved.addListener(tabHandler.windowRemoved);
      tabs.onActivated.addListener(tabHandler.activated);
      //webNavigation.onBeforeNavigate.addListener(tabHandler.resetVerified);
      webNavigation.onCompleted.addListener(tabHandler.updated);
      webNavigation.onHistoryStateUpdated.addListener(tabHandler.historyUpdated);
      tabs.onRemoved.addListener(tabHandler.removed);
      runtime.onMessage.addListener(tabHandler.handleMessage);
      utils.log("tabHandler.init: initialized -> next", utils.log_level_debug);
   },

   handleMessage: function(request, sender, sendResponse)
   {
      //utils.log("tabHandler.handleMessage: id: " + sender.tab.id + ", " + JSON.stringify(request), utils.log_level_debug);

      if(request.action == "setData")
      {
         tabHandler.cache[sender.tab.id].elapsed += request.elapsed;
         utils.log("tabHandler.handleMessage: id: " + sender.tab.id + ", setData: total: " + tabHandler.cache[sender.tab.id].elapsed + ", elapsed: " + request.elapsed, utils.log_level_debug);
         tabHandler.cache[sender.tab.id].channel = request.channel;
      }
      else if(request.action == "storeView")
      {
         tabHandler.storeView(request.view);
      }
   },

   windowChanged: function(windowId)
   {
      tabs.query({active: true, currentWindow: true}, function(response)
      {
         if(tabHandler.active && response[0] && tabHandler.active != response[0].id &&
            (!tabHandler.windowId || tabHandler.windowId != response[0].windowId))
         {
            utils.log("tabHandler.windowChanged: window changed -> call activated", utils.log_level_debug);
            tabHandler.windowId = response[0].windowId;
            tabHandler.activated({tabId: response[0].id});
         }
      });
   },

   windowRemoved: function(windowId)
   {
      utils.log("tabHandler.windowRemoved", utils.log_level_debug);

      tabs.query({active: true}, function(response)
      {
         tabHandler.windowId = response[0].windowId;
         tabHandler.activated({tabId: response[0].id});
      });
   },

   activated: function(tab)
   {
      utils.log("tabHandler.activated: id: " + tab.tabId + ", active: " + tabHandler.active, utils.log_level_debug);

      tabs.get(tab.tabId, function(tab)
      {
         /* store view for tab which is deactivated */
         if(tabHandler.active)
         {
            utils.log("tabHandler.activated: tab " + tabHandler.active + " is deactivated", utils.log_level_debug);
            //tabHandler.resetVerified();
            var tabDeactive = tabHandler.cache[tabHandler.active];

            tabHandler.sendMessage(tabDeactive.id, {action: "deactivate"}).then(function(response)
            {
               if(tabDeactive.domain != tabHandler.domain_internal)
               {
                  tabDeactive.elapsed += response.elapsed;
                  utils.log("tabHandler.activated: deactivated tab: " + tabDeactive.url + ", response: " + JSON.stringify(response) + ", total: " + tabDeactive.elapsed, utils.log_level_debug);
                  tabDeactive.channel = response.channel;
                  return tabHandler.storeView(tabDeactive, true);
               }
            }).catch(function(e)
            {
            });
         }

         /* tab not in cache -> add it */
         if(!tabHandler.cache[tab.id])
         {
            utils.log("tabHandler.activated: tab id: " + tab.id + ", url: " + tab.url + ". not in cache -> add it", utils.log_level_debug);

            tabHandler.cache[tab.id] =
            {
               id: tab.id,
               incognito: tab.incognito,
               url: tab.url,
               domain: tabHandler.getDomain(tab.url),
               name: tabHandler.getDomain(tab.url),
               elapsed: null
            };

            tabHandler.active = tab.id;
         }
         /* tab reactivated */
         else
         {
            utils.log("tabHandler.activated: tab " + tab.id + " was reactivated: " + JSON.stringify(tabHandler.cache[tab.id]), utils.log_level_debug);
            tabHandler.cache[tab.id].elapsed = null;
            tabHandler.active = tab.id;
         }

         tabs.sendMessage(tab.id, {action: "activate", id: tab.id, logLevel: bkg.config.logLevel});
         //tabHandler.displayVerified(tab.id);
      });
   },

   updated: function(details)
   {
      function setTabData(id, url, resetElapsed)
      {
         var storeTab = tabHandler.cache[id];
         storeTab.id = id;
         storeTab.url = url;
         storeTab.domain = tabHandler.getDomain(url);
         storeTab.name = tabHandler.getDomain(url);

         if(resetElapsed == true)
         {
            storeTab.elapsed = null;
         }

         tabHandler.cache[id] = storeTab;
      }

      if(details.frameId == 0)
      {
         //utils.log("tabHandler.updated: " + details.tabId + ", details: " + JSON.stringify(details) + ", old: " + tabHandler.cache[details.tabId].url + ", new: " + details.url, utils.log_level_debug);

         /* domain or channel changed */
         if(tabHandler.getDomain(details.url) != tabHandler.cache[details.tabId].domain ||
            (tabHandler.isChannel(details.url) && details.url != tabHandler.cache[details.tabId].url))
         {
            utils.log("tabHandler.updated: domain/channel changed. old: " + tabHandler.cache[details.tabId].domain + ", new: " + tabHandler.getDomain(details.url), utils.log_level_debug);

            /* old domain is external domain -> store view */
            if(tabHandler.cache[details.tabId].domain != tabHandler.domain_internal)
            {
               utils.log("tabHandler.updated: old domain is external (" + tabHandler.cache[details.tabId].url + ") -> store view", utils.log_level_debug);
               var storeTab = tabHandler.cache[details.tabId];

               tabHandler.storeView(storeTab, true).then(function()
               {
                  setTabData(details.tabId, details.url, true);
                  //tabHandler.displayVerified(details.tabId);
               }).catch(function(e)
               {
                  setTabData(details.tabId, details.url, true);
                  //tabHandler.displayVerified(details.tabId);
               });
            }
            /* old domain is internal domain -> don't store view */
            else
            {
               utils.log("tabHandler.updated: old domain is internal (" + tabHandler.cache[details.tabId].url + ") -> view not stored", utils.log_level_debug);
               setTabData(details.tabId, details.url, true);
               //tabHandler.displayVerified(details.tabId);
            }
         }
         /* domain/channel not changed -> don't store view, cumulate elapsed */
         else
         {
            utils.log("tabHandler.updated: domain/channel not changed -> view not stored, elapsed cumulated", utils.log_level_debug);
            // don't reset elapsed -> pass "false"
            setTabData(details.tabId, details.url, false);
            //tabHandler.displayVerified(details.tabId);
         }
      }
   },

   historyUpdated: function(details)
   {
      function setTabData(id, url)
      {
         var storeTab = tabHandler.cache[id];
         storeTab.id = id;
         storeTab.url = url;
         storeTab.domain = tabHandler.getDomain(url);
         storeTab.name = tabHandler.getDomain(url);
         storeTab.elapsed = null;

         tabHandler.cache[id] = storeTab;
      }

      utils.log("tabHandler.historyUpdated: " + JSON.stringify(details) + ", previous domain: " + tabHandler.getDomain(tabHandler.cache[details.tabId].url) + ", previous url: " + tabHandler.cache[details.tabId].url, utils.log_level_debug);

      // top-frame, same domains without path, different urls
      if(details.frameId == 0 &&
         tabHandler.getDomain(details.url) == tabHandler.getDomain(tabHandler.cache[details.tabId].url) &&
         details.url != tabHandler.cache[details.tabId].url)
      {
         utils.log("tabHandler.historyUpdated: conditions matched (top-frame, same domain, different url) -> send deactivate", utils.log_level_debug);
         //tabHandler.resetVerified();
         var storeTab = tabHandler.cache[details.tabId];

         tabHandler.sendMessage(details.tabId, {action: "deactivate"}).then(function(response)
         {
            utils.log("tabHandler.historyUpdated: response: " + JSON.stringify(response), utils.log_level_debug);
            storeTab.elapsed = response.elapsed;
            storeTab.channel = response.channel;
            return tabHandler.storeView(storeTab, true);
         }).then(function()
         {
            setTabData(details.tabId, details.url);
            tabs.sendMessage(details.tabId, {action: "activate", id: details.tabId, logLevel: bkg.config.logLevel});
            //tabHandler.displayVerified(details.tabId);
         }).catch(function(e)
         {
            setTabData(details.tabId, details.url);
            tabs.sendMessage(details.tabId, {action: "activate", id: details.tabId, logLevel: bkg.config.logLevel});
            //tabHandler.displayVerified(details.tabId);
         });
      }
      else
      {
         utils.log("tabHandler.historyUpdated: conditions not matched (top-frame, same domain, different url) -> nothing to do", utils.log_level_debug);
      }
   },

   removed: function(tab)
   {
      utils.log("tabHandler.removed: " + tab, utils.log_level_debug);
      var storeTab = tabHandler.cache[tab];

      /* external domain -> store view */
      if(storeTab.domain != tabHandler.domain_internal)
      {
         tabHandler.storeView(storeTab, true);
      }
      /* internal domain -> don't store view */
      else
      {
         utils.log("tabHandler.removed: internal domain (" + storeTab.url + ") -> view not stored", utils.log_level_debug);
      }

      tabHandler.active = null;
      tabHandler.cache[tab] = null;
      //tabHandler.resetVerified();
   },

   getDomain: function(url)
   {
      if(url.match(/(http|https):\/\/[^0-9.]+/))
      {
         var a = document.createElement("a");
         a.href = url;

         return a.hostname;
      }
      else
      {
         return tabHandler.domain_internal;
      }
   },

   storeView: function(view, addUnstored)
   {
      return new Promise(function(resolve, reject)
      {
         utils.log("tabHandler.storeView: begin storing: " + JSON.stringify(view), utils.log_level_debug);

         if(view.incognito == true)
         {
            utils.log("tabHandler.storeView: incognito mode active -> don't store", utils.log_level_debug);
            resolve();
            return;
         }

         // clone view to avoid changes in the original object
         var storeView = JSON.parse(JSON.stringify(view));

         if(storeView.elapsed == null)
         {
            utils.log("tabHandler.storeView: ERROR: elapsed is null: " + JSON.stringify(storeView), utils.log_level_error);
            resolve();
            return;
         }
         else if(storeView.elapsed == 0)
         {
            utils.log("tabHandler.storeView: elapsed is 0 -> view not stored", utils.log_level_error);
            resolve();
            return;
         }

         if(tabHandler.isChannel(storeView.url))
         {
            if(storeView.channel)
            {
               var site = tabHandler.getSiteData(storeView.domain, storeView.channel);
               storeView.domain = site.domain;
               storeView.name = site.name;
            }
            else
            {
               utils.log("tabHandler.storeView: ERROR: view couldn't be stored: channel is not set: " + JSON.stringify(storeView), utils.log_level_error);
               reject();
               return;
            }
         }

         // ledger.checkSite(storeView.domain, false).then(function(site)
         // {
         //    utils.log("tabHandler.storeView: checked: " + JSON.stringify(site), utils.log_level_debug);
         //
         //    storeView.domain = site.domain;
         //    storeView.included = site.included;
         //    storeView.verified = site.verified;
         //
         //    if(!storeView.name)
         //    {
         //       storeView.name = site.domain;
         //    }
         //
         //    return db.storeView(storeView);
         // })
         if(!storeView.name)
         {
            storeView.name = storeView.domain
         }
         storeView.included = bkg.config.autoInclude
         storeView.verified = false //for now
         db.storeView(storeView)
         .then(function()
         {
            utils.log("tabHandler.storeView: view successfully stored: " + JSON.stringify(storeView), utils.log_level_debug);
            resolve();
         }).catch(function(e)
         {
            utils.log("tabHandler.storeView: ERROR: view couldn't be stored: " + JSON.stringify(storeView) + ", error: " + e, utils.log_level_error);

            if(addUnstored == true)
            {
               utils.log("tabHandler.storeView: try to store as unstored view", utils.log_level_debug);

               db.addUnstoredView(storeView).then(function()
               {
                  resolve();
               }).catch(function(e)
               {
                  reject();
               });
            }
            else
            {
               reject();
            }
         });
      });
   },

   getSiteData: function(domain, channel)
   {
      var site = {};

      if(channel)
      {
         if(domain.match(/youtube/))
         {
            var providerName = "youtube";
            var providerDesc = "YouTube";
         }
         else if(domain.match(/twitch/))
         {
            var providerName = "twitch";
            var providerDesc = "Twitch";
         }

         site.domain = providerName + "#channel:" + channel.id;
         site.name = channel.name + " on " + providerDesc;
      }
      else
      {
         site.domain = domain;
      }

      return site;
   },

   isChannel: function(url)
   {
      if(url.match(/https:\/\/www\.youtube\.com\/(watch|embed)/) ||
         url.match(/https:\/\/www\.twitch\.tv\/$/) ||
         url.match(/https:\/\/www\.twitch\.tv\/videos\/[0-9]+$/) ||
         url.match(/https:\/\/www\.twitch\.tv\/[a-z0-9]+$/i))
      {
         utils.log("tabHandler.isChannel: true: url: " + url, utils.log_level_debug);
         return true;
      }
      else
      {
         utils.log("tabHandler.isChannel: false: url: " + url, utils.log_level_debug);
         return false;
      }
   },

   sendMessage: function(id, message)
   {
      return new Promise(function(resolve, reject)
      {
         tabs.sendMessage(id, message, function(response)
         {
            if(runtime.lastError)
            {
               utils.log("tabHandler.sendMessage: ERROR: sendMessage failed: id: " + id + ", message: " + JSON.stringify(message) + ", error: " + JSON.stringify(runtime.lastError), utils.log_level_error);
               reject();
            }
            else
            {
               resolve(response);
            }
         });
      });
   }
}

var db = {
  init: function()
  {
     utils.log("db.init: start initializing database...", utils.log_level_debug);

     return new Promise(function(resolve, reject)
     {
        storageDb.init("batify", bkg.config.logLevel).then(function()
        {
           var tables = [];
           tables.push({name: "site", fields: ["hostname", "name", "included", "verified", "pinned", "pinnedShare", "status"]});
           tables.push({name: "domain", fields: ["name", "publisher"]});
           tables.push({name: "view", fields: ["id_site", "duration", "timestamp"]});
           tables.push({name: "view_unstored", fields: ["data"]});
           tables.push({name: "contribution", fields: ["data", "errorCount", "status", "timestamp"]});

           return storageDb.createTables(tables);
        }).then(function()
        {
           utils.log("db.init: database initialized -> next", utils.log_level_debug);
           resolve();
        }).catch(function(e)
        {
           utils.log("db.init: ERROR: database initialization failed: " + e, utils.log_level_error);
           reject();
        });
     });
  },

  storeView: function(view)
  {
     return new Promise(function(resolve, reject)
     {
        if(bkg.config.paymentStatus == true)
        {
           utils.log("db.storeView: begin storing: " + JSON.stringify(view), utils.log_level_debug, utils.log_level_debug);

           db.addSite(view).then(function(site)
           {
              utils.log("db.storeView: site: " + JSON.stringify(site), utils.log_level_debug);

              return storageDb.insert
              (
                 "view",
                 {id_site: site.id, duration: view.elapsed, timestamp: Date.now()}
              );
           }).then(function()
           {
              utils.log("db.storeView: view successfully stored: " + JSON.stringify(view), utils.log_level_debug);
              bkg.sendMessage("refreshViews");
              resolve();
           }).catch(function(e)
           {
              utils.log("db.storeView: ERROR: storing view failed: " + JSON.stringify(view) + ", message: " + JSON.stringify(e), utils.log_level_error);
              reject();
           });
        }
        else
        {
           return Promise.resolve();
        }
     });
  },

  addSite: function(site)
  {
     return new Promise(function(resolve, reject)
     {
        db.getSites({hostname: site.domain}).then(function(sites)
        {
           if(sites.length == 0)
           {
              storageDb.insert
              (
                 "site",
                 {
                    hostname: site.domain,
                    name: site.name,
                    included: site.included,
                    verified: site.verified,
                    pinned: false,
                    pinnedShare: 0,
                    status: ledger.site_status_active
                 }
              ).then(function(result)
              {
                 utils.log("db.addSite: new site added: " + JSON.stringify(result), utils.log_level_debug);
                 resolve(result);
              }).catch(function(e)
              {
                 utils.log("db.addSite: ERROR: addSite failed: site: " + JSON.stringify(site) + ", error: " + e, utils.log_level_error);
                 reject();
              });
           }
           else
           {
              utils.log("db.addSite: site already exists -> not added: " + JSON.stringify(sites[0]), utils.log_level_debug);
              resolve(sites[0]);
           }
        }).catch(function(e)
        {
           utils.log("db.addSite: ERROR: addSite failed: site: " + JSON.stringify(site) + ", error: " + e, utils.log_level_error);
           reject();
        });
     });
  },

  addUnstoredView: function(view)
  {
     return new Promise(function(resolve, reject)
     {
        storageDb.insert("view_unstored", {data: view}).then(function(view)
        {
           utils.log("db.addUnstoredView: new unstored view added", utils.log_level_debug);
           resolve();
        }).catch(function(e)
        {
           utils.log("db.addUnstoredView: ERROR: addUnstoredView failed: " + e, utils.log_level_error);
           reject();
        });
     });
  },

  getSites: function(where)
  {
     return new Promise(function(resolve, reject)
     {
        storageDb.select("site", where).then(function(result)
        {
           resolve(result);
        }).catch(function(e)
        {
           utils.log("db.getSites: ERROR: sites couldn't be selected: " + e, utils.log_level_error);
           reject();
        });
     });
  },

  getDomain: function(domain)
  {
     return new Promise(function(resolve, reject)
     {
        storageDb.select("domain", {name: domain}).then(function(result)
        {
           resolve(result[0]);
        }).catch(function(e)
        {
           utils.log("db.getPublisher: ERROR: publisher couldn't be selected: " + e, utils.log_level_error);
           reject();
        });
     });
  },

  getViews: function(includedOnly, activeOnly)
  {
     function compare(a, b)
     {
        var result = 0;

        if(a.status == ledger.site_status_deleted)
        {
           result = 1;
        }
        else if(b.status == ledger.site_status_deleted)
        {
           result = -1;
        }
        else if(a.pinned == true && b.pinned == true)
        {
           if(a.share > b.share)
           {
              result = -1;
           }
           else if(a.share < b.share)
           {
              result = 1;
           }
        }
        else if(a.pinned == true)
        {
           result = -1;
        }
        else if(b.pinned == true)
        {
           result = 1;
        }
        else if(a.included == true && b.included == true)
        {
           if(a.duration < b.duration)
           {
              result = 1;
           }
           else if(a.duration > b.duration)
           {
              result = -1;
           }
        }
        else if(a.included == true)
        {
           result = -1;
        }
        else if(b.included == true)
        {
           result = 1;
        }
        else
        {
           if(a.duration < b.duration)
           {
              result = 1;
           }
           else if(a.duration > b.duration)
           {
              result = -1;
           }
        }

        return result;
     }

     return new Promise(function(resolve, reject)
     {
        var pinnedSites;
        var viewSites = [];
        var viewsOut = [];

        db.getSites({status: ledger.site_status_active, pinned: true}).then(function(sites)
        {
           pinnedSites = sites;
           var whereSite = {status: ledger.site_status_active};

           if(includedOnly == true)
           {
              whereSite.included = true;
           }

           return db.getSites(whereSite);
        }).then(function(sites)
        {
           var ids = [];

           for(var i = 0; i < sites.length; i++)
           {
              ids.push(sites[i].id);
              viewSites[sites[i].id] = sites[i];
           }

           return storageDb.select("view", {id_site: ids, duration: {">=": bkg.config.minViewDuration}});
        }).then(function(views)
        {
           var viewsBuffer = [];
           var viewsBufferFinal = [];

           /* aggregate views */
           for(var i = 0; i < views.length; i++)
           {
              var view = views[i];

              if(!viewsBuffer[view.id_site])
              {
                 viewsBuffer[view.id_site] =
                 {
                    siteId: view.id_site,
                    hostname: viewSites[view.id_site].hostname,
                    name: viewSites[view.id_site].name,
                    included: viewSites[view.id_site].included,
                    verified: viewSites[view.id_site].verified,
                    pinned: viewSites[view.id_site].pinned,
                    pinnedShare: viewSites[view.id_site].pinnedShare,
                    status: viewSites[view.id_site].status,
                    views: 0,
                    duration: 0
                 };
              }

              viewsBuffer[view.id_site].views++;
              viewsBuffer[view.id_site].duration += view.duration;
           }

           /* add pinned sites without views */
           for(var i = 0; i < pinnedSites.length; i++)
           {
              var pinned = pinnedSites[i];
              var found = false;

              for(id_site in viewsBuffer)
              {
                 if(id_site == pinned.id)
                 {
                    found = true;
                    break;
                 }
              }

              if(found == false)
              {
                 viewsBuffer[pinned.id] =
                 {
                    siteId: pinned.id,
                    hostname: pinned.hostname,
                    name: pinned.name,
                    included: true,
                    pinned: pinned.pinned,
                    pinnedShare: pinned.pinnedShare,
                    status: ledger.site_status_active,
                    views: 0,
                    duration: 0
                 };
              }
           }

           /* remove views with view count < minViews which are not pinned and calculate sums */
           var sharePinnedSum = 0;
           var durationSum = 0;

           for(var id_site in viewsBuffer)
           {
              if(viewsBuffer[id_site].pinned == true)
              {
                 viewsBufferFinal[id_site] = viewsBuffer[id_site];
                 viewsBufferFinal[id_site].share = viewsBufferFinal[id_site].pinnedShare;
                 sharePinnedSum += viewsBufferFinal[id_site].share;
              }
              else if(viewsBuffer[id_site].views >= bkg.config.minViews)
              {
                 viewsBufferFinal[id_site] = viewsBuffer[id_site];

                 if(viewsBuffer[id_site].included == true && viewsBuffer[id_site].pinned == false)
                 {
                    durationSum += viewsBufferFinal[id_site].duration;
                 }
              }
           }

           /* calculate shares */
           var shareSum = sharePinnedSum;

           for(var id_site in viewsBufferFinal)
           {
              if(viewsBufferFinal[id_site].included == true &&
                 viewsBufferFinal[id_site].pinned == false)
              {
                 var share = viewsBufferFinal[id_site].duration/durationSum * 100;
                 share = Math.round(share - (sharePinnedSum * share)/100);
                 viewsBufferFinal[id_site].share = share;
                 shareSum += share;
              }
              else if(viewsBufferFinal[id_site].included == false)
              {
                 viewsBufferFinal[id_site].share = 0;
              }

              viewsOut.push(viewsBufferFinal[id_site]);
           }

           /* add deleted sites */
           if(activeOnly == false)
           {
              return db.getSites({status: ledger.site_status_deleted});
           }
           else
           {
              return Promise.resolve([]);
           }
        }).then(function(sites)
        {
           for(var i = 0; i < sites.length; i++)
           {
              var site = sites[i];

              viewsOut.push(
              {
                 siteId: site.id,
                 hostname: site.hostname,
                 name: site.name,
                 included: false,
                 pinned: false,
                 pinnedShare: 0,
                 status: site.status,
                 views: 0,
                 duration: 0,
                 share: 0
              });
           }

           viewsOut = viewsOut.sort(compare);
           resolve(viewsOut);
        }).catch(function(e)
        {
           utils.log("db.getViews: ERROR: " + e, utils.log_level_error);
           reject();
        });
     });
  },
}

var utils =
{
  uuid4_type_persona: 1,
  uuid4_type_viewing: 2,

  log_level_debug: 1,
  log_level_error: 2,

  msecs:
  {
     day: 24 * 60 * 60 * 1000,
     hour: 60 * 60 * 1000,
     minute: 60 * 1000,
     second: 1000
  },

  log: function(message, level)
  {
     if(level >= bkg.config.logLevel)
     {
        console.log("BATify: " + message);
     }
  },

  getStorageData: function(name)
  {
     return new Promise(function(resolve, reject)
     {
        storage.local.get(name, function(items)
        {
           if(runtime.lastError)
           {
              utils.log("ERROR: value couldn't be got: name: " + name + ", msg: " + runtime.lastError, utils.log_level_error);
              reject();
           }
           else
           {
              if(Object.keys(items).length === 0 && items.constructor === Object)
              {
                 items = null;
              }

              resolve(items);
           }
        });
     });
  },
}

var ledger = {
  conf_env: "production",
  conf_contribute_frequency: 30, // days
  conf_vote_commit_delay_min: 10, // seconds
  conf_vote_commit_delay_max: 60 * 4, // seconds
  conf_contributor_interval: 1000 * 60 * 10,
  conf_voting_committer_interval: 1000 * 60,
  conf_site_updater_interval: 1000 * 60 * 60 * 12,
  conf_view_storer_interval: 1000 * 60 * 10,
  conf_max_contribution_errors: 10,
  conf_exchange_rate_max_age: 1000 * 60 * 10,

  default_budget: 4,
  default_min_view_duration: 0,
  default_min_views: 0,
  default_budget_currency: "USD",

  site_status_active: 1,
  site_status_deleted: 2,

  contrib_status_created: 1,
  contrib_status_payed: 2,
  contrib_status_captured: 3,
  contrib_status_viewing_registered: 4,
  contrib_status_voting_prepared: 5,
  contrib_status_voted: 6,
  contrib_status_voting_committed: 7,

  credentials: null,
  exchangeRate: null,
  exchangeRateLastChecked: null,
}

// initialize
bkg.init();

// var ledger = {
//
//   site_status_active: 1,
//
//   checkSite: function(site, forceServerCheck)
//   {
//      function getPublisher(site, forceServerCheck)
//      {
//         return new Promise(function(resolve, reject)
//         {
//            if(forceServerCheck == false)
//            {
//               db.getDomain(site).then(function(domain)
//               {
//                  if(domain)
//                  {
//                     db.getSites({hostname: domain.publisher}).then(function(sites)
//                     {
//                        if(sites.length > 0)
//                        {
//                           var result = {};
//                           result.domain = domain.publisher;
//                           result.included = sites[0].included;
//                           result.verified = sites[0].verified;
//                           resolve(result);
//                        }
//                        else
//                        {
//                           resolve(null);
//                        }
//                     }).catch(function(e)
//                     {
//                        resolve(null);
//                     });
//                  }
//                  else
//                  {
//                     resolve(null);
//                  }
//               }).catch(function(e)
//               {
//                  resolve(null);
//               });
//            }
//            else
//            {
//               resolve(null);
//            }
//         });
//      }
//
//      return new Promise(function(resolve, reject)
//      {
//         var result = {};
//
//         getPublisher(site, forceServerCheck).then(function(publisher)
//         {
//            if(publisher)
//            {
//               utils.log("ledger.checkSite: site: " + site + ", publisher in cache found: " + JSON.stringify(publisher), utils.log_level_debug);
//               resolve(publisher);
//            }
//            else
//            {
//               utils.log("ledger.checkSite: site: " + site + ", publisher not in cache found (forced: " + forceServerCheck + ") -> get information from server", utils.log_level_debug);
//               url = ledger.servers.ledger["production"].v3 + "/v3/publisher/identity?publisher=" + encodeURIComponent(site);
//
//               utils.httpGet(url).then(function(response)
//               {
//                  utils.log("ledger.checkSite: publisherInfo: " + JSON.stringify(response), utils.log_level_debug);
//
//                  result.domain = response.publisher;
//                  result.included = bkg.config.autoInclude;
//                  result.verified = false;
//
//                  if(response.properties.exclude && response.properties.exclude == true)
//                  {
//                     result.included = false;
//                  }
//
//                  if(response.properties.verified && response.properties.verified == true)
//                  {
//                     result.verified = true;
//                  }
//
//                  db.addDomain({name: site, publisher: response.publisher}).then(function()
//                  {
//                     resolve(result);
//                  }).catch(function(e)
//                  {
//                     utils.log("ledger.checkSite: ERROR: check site failed: " + JSON.stringify(site) + ", error: " + e, utils.log_level_error);
//                     reject();
//                  });
//               }).catch(function(e)
//               {
//                  utils.log("ledger.checkSite: ERROR: check site failed: " + JSON.stringify(site) + ", error: " + e, utils.log_level_error);
//                  reject();
//               });
//            }
//         });
//      });
//   },
// }
