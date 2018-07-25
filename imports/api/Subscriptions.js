import { Mongo } from 'meteor/mongo';

const Subscriptions = new Mongo.Collection('subscriptions', {connection: null})

// Keep indexedDB in sync with this collection
var subscriptionsObserver = new PersistentMinimongo2(Subscriptions, 'Gratiis')

export default Subscriptions
