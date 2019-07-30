import React from 'react'
import PresentationalComponent from '../components/SubscribeForm'
import currencySymbols from '../api/currencySymbols'
import { connect } from 'react-redux'
import { addSubscription, removeSubscription, setTabIndex } from '../actions'
import { convertToUSD } from '../api/ECBForexRates'

function SubscribeForm({ domainName, subscribed, subscribedAmount, currency, onSubscribe, onUnsubscribe, onChangeTab, classes }) {
  const [amount, setAmount] = React.useState('')
  const [expanded, setExpanded] = React.useState(false)
  const [inputError, setInputError] = React.useState(false)
  const disabled = (domainName === '')

  React.useEffect(reset, [domainName])

  function reset() {
    setAmount('')
    setExpanded(false)
    setInputError(false)
  }

  function handleClickSubscribe() {
    if (subscribed) {
      onUnsubscribe(domainName)
    }
    else if (!expanded) {
      setExpanded(true)
    }
    else if (amount === '') {
      setInputError(true)
    }
    else {
      onSubscribe(domainName, convertToUSD(currency, Number(amount)))
      .catch(() => {})
      .then(() => {
        reset()
        setTimeout(() => onChangeTab(1), 300)
      })
    }
  }

  return React.createElement(PresentationalComponent, {
    subscribed,
    expanded,
    disabled,
    subscribedAmount,
    currencySymbol: currencySymbols[currency],
    inputError,
    onChangeAmount: setAmount,
    onClickSubscribe: handleClickSubscribe
  })
}

function getSubscribedAmount(subscriptions, domainName) {
  let index = subscriptions.findIndex(sub => sub.domainName === domainName)
  if (index > -1)
    return subscriptions[index].amount
  return 0
}
const mapStateToProps = (state, ownProps) => ({
  subscribed: -1 !== state.subscriptions.findIndex(sub => sub.domainName === ownProps.domainName),
  subscribedAmount: getSubscribedAmount(state.subscriptions, ownProps.domainName),
  currency: state.settings['Currency'],
})
const mapDispatchToProps = dispatch => ({
  onSubscribe: (domainName, amount) => dispatch(addSubscription(domainName, amount)),
  onUnsubscribe: domainName => dispatch(removeSubscription(domainName)),
  onChangeTab: tabIndex => dispatch(setTabIndex(tabIndex))
})

export default connect(mapStateToProps, mapDispatchToProps)(SubscribeForm)
