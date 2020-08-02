import React from 'react'
import { connect } from 'react-redux'
import PresentationalComponent from '../components/Subscriptions'
import currencySymbols from '../api/currencySymbols'
import datetimeCalculators from '../api/datetimeCalculators'
import { removeSubscription, setTarget } from '../actions'
import { convertFromUSD } from '../api/ECBForexRates'

function Subscriptions(props) {
  const {
    subscriptions,
    currency,
    paymentSchedule,
    onUnsubscribe,
    setTarget,
    inView,
    onChangeTab,
  } = props
  const [newRowIndex, setNewRowIndex] = React.useState(-1)

  React.useEffect(() => {
    if (newRowIndex !== subscriptions.length - 1)
      setNewRowIndex(subscriptions.length - 1)
  }, [subscriptions])

  return React.createElement(PresentationalComponent, {
    subscriptions: subscriptions.map(sub => ({ ...sub, amount: convertFromUSD(currency, sub.amount)})),
    highlightedRowIndex: newRowIndex,
    onUnsubscribe,
    onClickSubscription: sub => {setTarget(sub.address.replace('.dnsroot.eth', '').replace('.dnsroot.test', '')); onChangeTab(0)},
    currency,
    currencySymbol: currencySymbols[currency],
    nextPayment: datetimeCalculators[paymentSchedule](Date.now())
  })
}

// Update component only when tabIndex == 1
const notInView = (prevProps, nextProps) => !nextProps.inView

const mapStateToProps = state => ({
  subscriptions: state.subscriptions,
  currency: state.settings['Currency'],
  paymentSchedule: state.settings['Payment schedule']
});
const mapDispatchToProps = dispatch => ({
  onUnsubscribe: address => dispatch(removeSubscription(address)),
  setTarget: target => dispatch(setTarget(target))
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(React.memo(Subscriptions, notInView))
