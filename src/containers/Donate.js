import React from 'react';
import { connect } from 'react-redux'
import InputAmount from '../components/InputAmount'
import { buyTHX } from '../api/blockchain'
import web3js from '../api/web3js'
import strings from '../api/strings'
import { reviewTx } from '../actions'
import { createTxBuyThx } from '../api/blockchain'
import { convertToUSD } from '../api/ECBForexRates'

function Donate({ donate, currency, address, subscription }) {
  const [amount, setAmount] = React.useState(2.0)

  return React.createElement(InputAmount, {
    amount,
    currencySymbol: strings.currency[currency],
    onChange: e => setAmount(e.target.value),
    onClick: () => donate(address, convertToUSD(currency, amount)),
    buttonText: "Give",
    buttonDisabled: subscription.hostname === '',
    tooltip: "buy tokens from " + subscription.hostname,
  })
}

const mapStateToProps = state => ({
  currency: state.settings.currency,
  address: state.wallet.addresses[0]
})
const mapDispatchToProps = (dispatch, ownProps) => ({
  donate: (from, amount) => {
    createTxBuyThx(from, ownProps.subscription.hostname, amount)
    .then(tx => {
      dispatch(reviewTx({
        tx: tx,
        info: {
          counterparties: [ownProps.subscription.hostname,],
          values: [web3js.utils.toWei(amount.toString()),],
        }
      }))
    })
  }
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Donate)
