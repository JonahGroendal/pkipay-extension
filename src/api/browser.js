/*global chrome*/
/*global browser*/
import mockChrome from './mockChrome'
import zlib from 'zlib'

// if ( (typeof browser === 'undefined' || typeof browser.tabs === 'undefined')
//   && (typeof chrome === 'undefined' || typeof chrome.tabs === 'undefined') )
// {
//   console.log('Using mock chrome API')
//   var browser = mockChrome
// }
// else if (typeof browser === 'undefined' || typeof browser.tabs === 'undefined') {
//   var browser = chrome
// }
// export default browser

const api = (chrome || browser)
  ? (chrome.tabs || browser.tabs) ? chrome || browser : mockChrome
  : mockChrome

export default api

export function loadState() {
  console.log('loading state!')
  return new Promise((resolve, reject) => {
    Promise.all([getFromStorage(null), getHostname()])
    .then(([storage, hostname]) => {
      const serializedState = Object.keys(storage).filter(k => k.includes('state')).sort().map(k => storage[k]).join('')
      if (serializedState) {
        console.log(serializedState.substring(23000, 24000))
        resolve({
          ...JSON.parse(serializedState),
          objectHostname: hostname
        })
      } else {
        resolve({ objectHostname: hostname })
      }
    })
    .catch(reject)
  })
}

export function saveState(state) {
  console.log('saving state:', state)
  const serializedState = JSON.stringify(state)
  let chunks = {}
  for (let i=0; i<serializedState.length/6000; i++) {
    chunks['state'+i.toString().padStart(2,'0')] = serializedState.substring(i*6000, i*6000 + 6000)
  }
  api.storage.sync.set(chunks)
}

export function getFromStorage(keys) {
  return new Promise(function(resolve, reject) {
    api.storage.sync.get(keys, function(result) {
      if (!api.lastError)
        resolve(result)
      else
        reject(api.lastError)
    })
  })
}

export function getHostname() {
  return new Promise(function(resolve, reject) {
    api.tabs.query({ 'active': true, 'lastFocusedWindow': true }, (tabs) => {
      if (!api.lastError)
        resolve(getDomain(tabs[0].url))
      else
        reject(api.lastError)
    })
  })
}

// Same as tabHandler.getDomain() in background.js
function getDomain(url)
{
  console.log(url)
   if (url.match(/(http|https):\/\/[^0-9.]+/)) {
      var a = document.createElement("a");
      a.href = url;

      return a.hostname;
   }
   else {
      return '';
   }
}
