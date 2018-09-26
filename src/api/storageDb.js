import browser from './browser'

// Views must be gotten via background.js due to BATify's use of the storagedb.js
// background page
const getViews = () => {
  return new Promise(function(resolve, reject) {
    browser.runtime.sendMessage({action: "getViews"}, function(views) {
      if (browser.runtime.lastError) {
        reject(browser.runtime.lastError)
      }
      else {
        resolve(views)
      }
    });
  })
}

const getSites = () => {
  return new Promise(function(resolve, reject) {
    browser.runtime.sendMessage({action: "getSites"}, function(sites) {
      if (browser.runtime.lastError) {
        reject(browser.runtime.lastError)
      }
      else {
        resolve(sites)
      }
    });
  })
}

export { getViews, getSites }
