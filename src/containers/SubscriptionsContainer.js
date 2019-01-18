import React from 'react'
import { connect } from 'react-redux'
import Subscriptions from '../components/Subscriptions'
import strings from '../api/strings'
import { removeSubscription, setObjectHostname } from '../actions'

function SubscriptionsContainer(props) {
  const {
    subscriptions,
    currency,
    paymentSchedule,
    onUnsubscribe,
    setObject,
    onChangeIndex,
  } = props

  const nextPayment = strings.paymentSchedule[paymentSchedule](Date.now())
  const currencySymbol = strings.currency[currency]

  function onClickSubscription(subscription) {
    setObject(subscription.hostname)
    onChangeIndex(0)
  }

  return React.createElement(Subscriptions, {
    subscriptions,
    onUnsubscribe,
    onClickSubscription,
    currency,
    currencySymbol,
    nextPayment
  })
}

const mapStateToProps = state => ({
  subscriptions: state.subscriptions,
  currency: state.settings.currency,
  paymentSchedule: state.settings.paymentSchedule
});
const mapDispatchToProps = dispatch => ({
  onUnsubscribe: hostname => dispatch(removeSubscription(hostname)),
  setObject: hostname => dispatch(setObjectHostname(hostname))
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SubscriptionsContainer)
