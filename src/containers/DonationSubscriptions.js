import React from 'react'
import { connect } from 'react-redux'
import PresentationalComponent from '../components/DonationSubscriptions'
import currencySymbols from '../api/currencySymbols'
import datetimeCalculators from '../api/datetimeCalculators'
import { removeDonationSubscription, setTarget } from '../actions'
import { convertFromUSD } from '../api/ECBForexRates'

function DonationSubscriptions(props) {
  const {
    subscriptions,
    currency,
    paymentSchedule,
    onUnsubscribe,
    setTarget,
    onChangeTab,
    inView
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
  subscriptions: state.donationSubscriptions,
  currency: state.settings['Currency'],
  paymentSchedule: state.settings['Payment schedule'],
});
const mapDispatchToProps = dispatch => ({
  onUnsubscribe: (ensAddress, tokenAddr) => dispatch(removeDonationSubscription(ensAddress, tokenAddr)),
  setTarget: target => dispatch(setTarget(target))
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(React.memo(DonationSubscriptions, notInView))
