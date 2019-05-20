/*global chrome*/
/*global browser*/
import mockChrome from './mockChrome'
var zlib = require('zlib');

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

const api = ((typeof browser === 'undefined' || typeof browser.tabs === 'undefined')
            && (typeof chrome === 'undefined' || typeof chrome.tabs === 'undefined'))
            ? mockChrome
            : (typeof browser === 'undefined' || typeof browser.tabs === 'undefined')
               ? chrome
               : browser

// const api = (typeof chrome !== 'undefined' || typeof browser !== 'undefined')
//   ? (chrome.tabs || browser.tabs) ? chrome || browser : mockChrome
//   : mockChrome

export default api

export async function loadState() {
  const storage = await getFromStorage(null)
  const compressed = Object.keys(storage).filter(k => k.includes('state')).sort().map(k => storage[k]).join('')
  if (compressed) {
    const serialized = (await inflate(compressed)).toString('utf8')
    return JSON.parse(serialized)
  }
  return undefined
}

export async function saveState(state) {
  const serialized = JSON.stringify(state)
  const compressed = await deflate(serialized)
  let chunks = {}
  for (let i=0; i<compressed.length/2048; i++) {
    chunks['state'+i.toString().padStart(2,'0')] = compressed.substring(i*2048, i*2048 + 2048)
  }
  await setToStorage(chunks)
}

export function getUrl() {
  return new Promise(function(resolve, reject) {
    api.tabs.query({ 'active': true, 'lastFocusedWindow': true }, (tabs) => {
      if (!api.lastError)
        resolve(tabs[0].url)
      else
        reject(api.lastError)
    })
  })
}

export function getHostname(url) {
   if (url.match(/https:\/\/[^0-9.]+/)) {
      var a = document.createElement("a");
      a.href = url;

      return a.hostname.split('.').slice(-2).join('.')
   }
   return ''
}

function deflate(buffer) {
  return new Promise((resolve, reject) => {
    zlib.deflate(buffer, (err, res) => {
      if (err) reject(err)
      else resolve(res.toString('base64'))
    })
  })
}

function inflate(buffer) {
  return new Promise((resolve, reject) => {
    zlib.inflate(new Buffer(buffer, 'base64'), (err, res) => {
      if (err) reject(err)
      else resolve(res)
    })
  })
}

function getFromStorage(keys) {
  return new Promise(function(resolve, reject) {
    api.storage.sync.get(keys, function(result) {
      if (!api.lastError)
        resolve(result)
      else
        reject(api.lastError)
    })
  })
}

function setToStorage(data) {
  return new Promise(function(resolve, reject) {
    api.storage.sync.set(data, function(result) {
      if (!api.lastError)
        resolve(result)
      else
        reject(api.lastError)
    })
  })
}
