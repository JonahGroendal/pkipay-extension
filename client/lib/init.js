import mockChrome from '../../imports/test/mockChrome.js';

if ( (typeof browser === 'undefined' || typeof browser.tabs === 'undefined')
  && (typeof chrome === 'undefined' || typeof chrome.tabs === 'undefined') )
{
  console.log('Using mock chrome API')
  browser = mockChrome
}
else if (typeof browser === 'undefined' || typeof browser.tabs === 'undefined') {
  browser = chrome
}
