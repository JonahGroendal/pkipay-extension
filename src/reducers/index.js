import { combineReducers } from 'redux'
import objectHostname from './objectHostname'
import subscriptions from './subscriptions'
import settings from './settings'
import unlockWalletScreen from './unlockWalletScreen'
import transactionScreen from './transactionScreen'
import scheduledTXs from './scheduledTXs'
import wallet from './wallet'
import pages from './pages'
import dnsChallenge from './dnsChallenge'

export default combineReducers({
  objectHostname,
  subscriptions,
  settings,
  unlockWalletScreen,
  transactionScreen,
  wallet,
  scheduledTXs,
  pages,
  dnsChallenge
})
