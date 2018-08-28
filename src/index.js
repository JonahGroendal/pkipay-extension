/*global web3*/
/*global browser*/
/*global chrome*/
import React from 'react';
//import { Meteor } from 'meteor/meteor';
import ReactDOM from 'react-dom';
import App from './App.js';
import mockChrome from './api/mockChrome';
import registerServiceWorker from './registerServiceWorker';
import Web3 from 'web3';

let web3js
if (typeof web3 !== 'undefined') {
  // Use Mist/MetaMask's provider
  web3js = new Web3(web3.currentProvider)
} else {
  console.log("Using Infura for web3")
  web3js = new Web3(new Web3.providers.WebsocketProvider("ws://localhost:8545"));
  //web3js = new Web3(new Web3.providers.HttpProvider("https://rinkeby.infura.io/VyklZt7tGRrfmhhyMHG8"))
  //web3js = new Web3(new Web3.providers.WebsocketProvider("wss://rinkeby.infura.io/_ws"))
}

if ( (typeof browser === 'undefined' || typeof browser.tabs === 'undefined')
  && (typeof chrome === 'undefined' || typeof chrome.tabs === 'undefined') )
{
  console.log('Using mock chrome API')
  var browser = mockChrome
}
else if (typeof browser === 'undefined' || typeof browser.tabs === 'undefined') {
  var browser = chrome
}

browser.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {

  ReactDOM.render(<App web3js={web3js} browser={browser} url={tabs[0].url} />, document.getElementById('render-target'));
  registerServiceWorker();

});
