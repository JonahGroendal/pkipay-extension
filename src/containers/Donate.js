import React from 'react';
import { connect } from 'react-redux'
import InputAmount from '../components/InputAmount'
import currencySymbols from '../api/currencySymbols'
import { reviewTx } from '../actions'
import { createTxBuyThx, tokenBuyerApproved, createTxApproveTokenBuyer } from '../api/blockchain'
import { convertToUSD } from '../api/ECBForexRates'

function Donate({ donate, currency, address, domainName }) {
  const [amount, setAmount] = React.useState(2.0)

  return React.createElement(InputAmount, {
    amount,
    currencySymbol: currencySymbols[currency],
    onChange: e => setAmount(e.target.value),
    onClick: () => donate(address, convertToUSD(currency, amount)),
    buttonText: "Donate Once",
    buttonDisabled: domainName === '',
    tooltip: "buy tokens from " + domainName,
  })
}

const mapStateToProps = state => ({
  currency: state.settings['Currency'],
  address: state.wallet.addresses[state.wallet.defaultAccount]
})
const mapDispatchToProps = (dispatch, ownProps) => ({
  donate: async (from, amount) => {
    const txs = []
    const approved = await tokenBuyerApproved(from)
    if (!approved)
      txs.push(createTxApproveTokenBuyer(from))
    txs.push(createTxBuyThx(from, ownProps.domainName, amount))
    dispatch(reviewTx(txs, [ownProps.domainName], [{ 'DAI': amount*-1, 'tokens': amount }]))
  }
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Donate)
