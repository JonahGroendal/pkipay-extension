import { combineReducers } from 'redux'
import subscriptions from './subscriptions'
import settings from './settings'
import objectHostname from './objectHostname'
import unlockWalletScreen from './unlockWalletScreen'
import transactionScreen from './transactionScreen'
import scheduledTXs from './scheduledTXs'
import wallet from './wallet'
import pages from './pages'

export default combineReducers({
  subscriptions,
  settings,
  objectHostname,
  unlockWalletScreen,
  transactionScreen,
  wallet,
  scheduledTXs,
  pages,
})
