import React from 'react'
import { connect } from 'react-redux'
import Subscriptions from '../components/Subscriptions'
import strings from '../api/strings'
import { removeSubscription, setObjectHostname } from '../actions'
import { convertFromUSD } from '../api/ECBForexRates'

function SubscriptionsContainer(props) {
  const {
    subscriptions,
    currency,
    paymentSchedule,
    onUnsubscribe,
    setObject,
    onChangeIndex,
  } = props

  const [newRowIndex, setNewRowIndex] = React.useState(-1)

  React.useEffect(() => {
    if (newRowIndex !== subscriptions.length - 1)
      setNewRowIndex(subscriptions.length - 1)
  }, [subscriptions])

  return React.createElement(Subscriptions, {
    subscriptions: subscriptions.map(sub => ({ ...sub, amount: convertFromUSD(currency, sub.amount)})),
    highlightedRowIndex: newRowIndex,
    onUnsubscribe,
    onClickSubscription: sub => {setObject(sub.hostname); onChangeIndex(0)},
    currency,
    currencySymbol: strings.currency[currency],
    nextPayment: strings.paymentSchedule[paymentSchedule](Date.now())
  })
}

// Update component only when tabIndex == 1
const notInView = (prevProps, nextProps) => nextProps.tabIndex !== 1
SubscriptionsContainer = React.memo(SubscriptionsContainer, notInView)

const mapStateToProps = state => ({
  subscriptions: state.subscriptions,
  currency: state.settings.currency,
  paymentSchedule: state.settings.paymentSchedule,
  tabIndex: state.pages.tabIndex
});
const mapDispatchToProps = dispatch => ({
  onUnsubscribe: hostname => dispatch(removeSubscription(hostname)),
  setObject: hostname => dispatch(setObjectHostname(hostname))
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SubscriptionsContainer)
