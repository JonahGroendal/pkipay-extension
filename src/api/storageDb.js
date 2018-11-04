import browser from './browser'

// Views must be gotten via background.js due to BATify's use of the storagedb.js
// background page
function getViews() {
  return new Promise(function(resolve, reject) {
    browser.runtime.sendMessage({action: "getViews"}, function(views) {
      if (browser.runtime.lastError)
        reject(browser.runtime.lastError)
      else
        resolve(views)
    })
  })
}

function getFormattedViews() {
  function formatHostname(hostname) {
    console.log(hostname)
    let parts = hostname.split(".")
    if (parts.length >= 2)
      return parts[parts.length-2].slice(0, 1).toUpperCase() + parts[parts.length-2].slice(1)
    else
      return hostname
  }
  function formatDuration(duration) {
     var hours = Math.floor(duration/3600)
     duration %= 3600
     var minutes = Math.floor(duration/60)
     var seconds = Math.floor(duration % 60)
     return hours.toString().padStart(2, "0") + ":" + minutes.toString().padStart(2, "0") + ":" + seconds.toString().padStart(2, "0")
  }
  return new Promise(function(resolve, reject) {
    getViews()
    .then(rawViews => {
      console.log(rawViews)
      let views = []
      rawViews.forEach(rawView => {
        let name = rawView.name
        if (name === rawView.hostname) {
          name = formatHostname(name)
        }
        views.push({
          id: rawView.siteId,
          name: name,
          hostname: rawView.hostname,
          duration: formatDuration(rawView.duration),
          views: rawView.views,
          share: rawView.share
        }) // Using siteId as id might be problematic
      })
      resolve(views)
    })
    .catch(reject)
  })
}

function getSites() {
  return new Promise(function(resolve, reject) {
    browser.runtime.sendMessage({action: "getSites"}, function(sites) {
      if (browser.runtime.lastError)
        reject(browser.runtime.lastError)
      else
        resolve(sites)
    })
  })
}

function setIncluded(siteId, status) {
  return new Promise(function(resolve, reject) {
    browser.runtime.sendMessage({action: "setIncluded", siteId: siteId, status: status}, function(statusDidChange) {
      if (browser.runtime.lastError)
        reject(browser.runtime.lastError)
      else
        resolve(statusDidChange)
    })
  })
}

export { getViews, getFormattedViews, getSites, setIncluded }
