import mockChrome from '../../imports/test/mockChrome.js';

if (typeof browser === 'undefined' && typeof chrome === 'undefined') {
  console.log('Using mock browser object')
  browser = mockChrome
}
else if (typeof browser === 'undefined') {
  browser = chrome
}
