import React from 'react'
import { connect } from 'react-redux'
import PresentationalComponent from '../components/DonationSubscriptions'
import currencySymbols from '../api/currencySymbols'
import datetimeCalculators from '../api/datetimeCalculators'
import { removeDonationSubscription, setTarget } from '../actions'
import { getUsdExchangeRate } from '../api/ECBForexRates'

function DonationSubscriptions(props) {
  const {
    subscriptions,
    currency,
    paymentSchedule,
    onUnsubscribe,
    setTarget,
    onChangeTab,
    inView,
    addedTokens
  } = props

  const [newRowIndex, setNewRowIndex] = React.useState(-1)
  const [usdExchangeRate, setUsdExchangeRate] = React.useState(0)

  React.useEffect(() => {
    if (newRowIndex !== subscriptions.length - 1)
      setNewRowIndex(subscriptions.length - 1)
  }, [subscriptions])

  React.useEffect(() => {
    if (currency) {
      getUsdExchangeRate(currency).then(setUsdExchangeRate)
    }
  }, [currency])

  return React.createElement(PresentationalComponent, {
    subscriptions: subscriptions.map(sub => ({ ...sub, amount: usdExchangeRate * sub.amount })),
    highlightedRowIndex: newRowIndex,
    onUnsubscribe,
    onClickSubscription: sub => {setTarget(sub.address.replace('.dnsroot.eth', '').replace('.dnsroot.test', '')); onChangeTab(0)},
    currency,
    currencySymbol: currencySymbols[currency],
    nextPayment: datetimeCalculators[paymentSchedule](Date.now()),
    addedTokens
  })
}

// Update component only when tabIndex == 1
const notInView = (prevProps, nextProps) => !nextProps.inView

const mapStateToProps = state => ({
  subscriptions: state.donationSubscriptions,
  currency: state.settings['Currency'],
  paymentSchedule: state.settings['Payment schedule'],
  addedTokens: state.wallet.addedTokens
});
const mapDispatchToProps = dispatch => ({
  onUnsubscribe: (ensAddress, tokenAddr) => dispatch(removeDonationSubscription(ensAddress, tokenAddr)),
  setTarget: target => dispatch(setTarget(target))
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(React.memo(DonationSubscriptions, notInView))
