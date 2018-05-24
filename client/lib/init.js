import mockChrome from '../../imports/test/mockChrome.js';

// For testing:
if (typeof chrome === 'undefined') {
  console.log('Using mock chrome object')
  chrome = mockChrome
}
