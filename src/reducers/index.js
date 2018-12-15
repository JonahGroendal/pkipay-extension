import { combineReducers } from 'redux'
import subscriptions from './subscriptions'
import settings from './settings'
import nextPayment from './nextPayment'

export default combineReducers({
  subscriptions,
  settings,
  nextPayment
})
