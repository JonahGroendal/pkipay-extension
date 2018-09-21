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
