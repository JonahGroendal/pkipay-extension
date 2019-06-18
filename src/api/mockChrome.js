let mockChrome = {
  runtime: {
    views: [{
      duration: 45.000,
      hostname: "open.spotify.com",
      included: true,
      name: "spotify.com",
      pinned: false,
      pinnedShare: 0,
      share: 45,
      siteId: 1,
      status: 1,
      verified: false,
      views: 2
    }, {
      duration: 55.000,
      hostname: "www.facebook.com",
      included: true,
      name: "facebook.com",
      pinned: false,
      pinnedShare: 0,
      share: 55,
      siteId: 2,
      status: 1,
      verified: false,
      views: 4
    }],
    sendMessage: function(messageObj, callback) {
      if (messageObj.action === "getViews") {
        callback(mockChrome.runtime.views)
      } else if (messageObj.action === "setIncluded") {
        mockChrome.runtime.views = mockChrome.runtime.views.filter(view => view.siteId !== messageObj.siteId)
      }
    }
  },
  tabs: {
    query: function(obj, callback) {
      let tabs = [{url: "https://www.pkipay.net/"}]
      callback(tabs);
    },
    onActivated: {
      addListener: function(whatToDo) {}
    }
  },
  storage: {
    local: {
      get: function(obj, callback) {
        if (typeof obj === 'string') obj = [obj];
        let retObj = {}
        if (Array.isArray(obj)) {
          let value;
          let key;
          for (key in obj) {
            value = mockChrome.storage.local.data[key];
            if (value) retObj[key] = value
          }
          callback(retObj)
        } else {
          let key
          for (key in obj) {
            retObj[key] = ( mockChrome.storage.local.data[key] || obj[key] )
          }
          callback(retObj)
        }
      },
      set: function(obj) {
        let key
        for (key in obj) {
          mockChrome.storage.local.data[key] = JSON.parse(JSON.stringify(obj[key]))
        }
      },
      data: {}
    },
    sync: {
      get: function(obj, callback) {
        if (typeof obj === 'string') obj = [obj];
        let retObj = {}
        if (Array.isArray(obj)) {
          let value;
          let key;
          for (key in obj) {
            value = mockChrome.storage.sync.data[key];
            if (value) retObj[key] = value
          }
          callback(retObj)
        } else {
          let key
          for (key in obj) {
            retObj[key] = ( mockChrome.storage.sync.data[key] || obj[key] )
          }
          callback(retObj)
        }
      },
      set: function(obj) {
        let key
        for (key in obj) {
          mockChrome.storage.sync.data[key] = JSON.parse(JSON.stringify(obj[key]))
        }
      },
      data: {}
    }
  },
  downloads: {
    download: (obj) => {}
  }
}

export default mockChrome
