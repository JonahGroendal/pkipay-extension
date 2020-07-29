import { combineReducers } from 'redux'
import target from './target'
// old - not going into 1.0: import subscriptions from './subscriptions'
import donationSubscriptions from './donationSubscriptions'
import settings from './settings'
import unlockWalletScreen from './unlockWalletScreen'
import transactionScreen from './transactionScreen'
import scheduledTXs from './scheduledTXs'
import wallet from './wallet'
import pages from './pages'
import dnsChallenge from './dnsChallenge'

export default combineReducers({
  target,
  // old - not going into 1.0: subscriptions,
  donationSubscriptions,
  settings,
  unlockWalletScreen,
  transactionScreen,
  wallet,
  scheduledTXs,
  pages,
  dnsChallenge
})
