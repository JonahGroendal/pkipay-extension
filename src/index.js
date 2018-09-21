import App from './App.js'
import contractGratis from './api/contractGratis'
import browser from './api/browser'
import mockChrome from './api/mockChrome'
import React from 'react'
import ReactDOM from 'react-dom'
import registerServiceWorker from './registerServiceWorker'

browser.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {

  ReactDOM.render(<App url={tabs[0].url} />, document.getElementById('render-target'));
  registerServiceWorker();

});
