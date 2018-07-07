import { Mongo } from 'meteor/mongo';

const Settings = new Mongo.Collection('settings', {connection: null})

// Keep indexedDB in sync with this collection
var settingsObserver = new PersistentMinimongo2(Settings, 'Gratis', function() {
  // Initialize collection if uninitialized
  if (Settings.find({}).count() === 0) {
    Settings.insert({
      budget: 4,
      budgetCurrency: "USD",
      lastContribution: '',
      nextContribution: Date.now() + 30 * 24 * 60 * 60 * 1000 // one month from now
    })
    console.log("'settings' collection initialized")
  }
})

export default Settings
