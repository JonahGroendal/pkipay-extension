/*global chrome*/
/*global browser*/
import mockChrome from './mockChrome'

if ( (typeof browser === 'undefined' || typeof browser.tabs === 'undefined')
  && (typeof chrome === 'undefined' || typeof chrome.tabs === 'undefined') )
{
  console.log('Using mock chrome API')
  var browser = mockChrome
}
else if (typeof browser === 'undefined' || typeof browser.tabs === 'undefined') {
  var browser = chrome
}


export default browser

export function getFromStorage(keys) {
  return new Promise(function(resolve, reject) {
    browser.storage.local.get(keys, function(result) {
      if (!browser.lastError)
        resolve(result)
      else
        reject(browser.lastError)
    })
  })
}
