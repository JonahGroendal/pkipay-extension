import React from 'react'
import PresentationalComponent from '../components/SubscribeForm'
import strings from '../api/strings'
import { withStyles } from '@material-ui/core/styles'
import { connect } from 'react-redux'
import { addSubscription, removeSubscription, setTabIndex } from '../actions'
import { convertToUSD } from '../api/ECBForexRates'

function SubscribeForm({ subscription, subscribed, subscribedAmount, currency, onSubscribe, onUnsubscribe, onChangeTab, classes }) {
  const [amount, setAmount] = React.useState('')
  const [expanded, setExpanded] = React.useState(false)
  const [inputError, setInputError] = React.useState(false)
  const disabled = (subscription.hostname === '')

  React.useEffect(reset, [subscription.hostname])

  function reset() {
    setAmount('')
    setExpanded(false)
    setInputError(false)
  }

  function handleClickSubscribe() {
    if (subscribed) {
      onUnsubscribe(subscription.hostname)
    }
    else if (!expanded) {
      setExpanded(true)
    }
    else if (amount === '') {
      setInputError(true)
    }
    else {
      onSubscribe({
        hostname: subscription.hostname,
        amount: convertToUSD(currency, Number(amount))
      })
      .then(reset)
      .then(() => setTimeout(() => onChangeTab(1), 400))
      .catch(() => {})
    }
  }

  return React.createElement(PresentationalComponent, {
    subscribed,
    expanded,
    disabled,
    subscribedAmount,
    currencySymbol: strings.currency[currency],
    inputError,
    onChangeAmount: setAmount,
    onClickSubscribe: handleClickSubscribe
  })
}

function getSubscribedAmount(subscriptions, subscription) {
  let index = subscriptions.findIndex(sub => sub.hostname === subscription.hostname)
  if (index > -1)
    return subscriptions[index].amount
  return 0
}
const mapStateToProps = (state, ownProps) => ({
  subscribed: -1 !== state.subscriptions.findIndex(sub => sub.hostname === ownProps.subscription.hostname),
  subscribedAmount: getSubscribedAmount(state.subscriptions, ownProps.subscription),
  currency: state.settings.currency,
})
const mapDispatchToProps = dispatch => ({
  onSubscribe: sub => dispatch(addSubscription(sub)),
  onUnsubscribe: hostname => dispatch(removeSubscription(hostname)),
  onChangeTab: tabIndex => dispatch(setTabIndex(tabIndex))
})

export default connect(mapStateToProps, mapDispatchToProps)(SubscribeForm)
