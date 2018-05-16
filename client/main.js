/*global chrome*/
import React from 'react';
import { Meteor } from 'meteor/meteor';
import { render } from 'react-dom';
import App from '../imports/ui/App.js';


chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {

  Meteor.startup(() => {
      render(<App url={tabs[0].url} />, document.getElementById('render-target'));
  });

});
