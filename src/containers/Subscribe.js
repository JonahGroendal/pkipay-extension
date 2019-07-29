import React from 'react';
import { connect } from 'react-redux'
import InputAmount from '../components/InputAmount'
import { buyTHX } from '../api/blockchain'
import web3js from '../api/web3js'
import currencySymbols from '../api/currencySymbols'
import { reviewTx } from '../actions'
import { createTxBuyThx } from '../api/blockchain'

function Subscribe({ subscribe, currency, address, subscription }) {
  const [amount, setAmount] = React.useState(2.0);

  const currencySymbol = currencySymbols[currency];
  const onChange = e => setAmount(e.target.value)
  const onClick = () => subscribe(amount)

  console.log("Subscribe")

  return React.createElement(InputAmount, {
    amount,
    currencySymbol,
    onChange,
    onClick,
    buttonText: "Give",
    tooltip: "buy tokens from " + subscription.hostname,
  })
}

const mapStateToProps = state => ({
  currency: state.settings['Currency'],
  address: state.wallet.addresses[state.wallet.defaultAccount]
})
const mapDispatchToProps = (dispatch, ownProps) => ({
  subscribe: amount => {
    console.log("subscribe")
    console.log(scheduleTx)
    dispatch(scheduleTx())

    // createTxBuyThx(from, ownProps.subscription.hostname, amount)
    // .then(tx => {
    //   dispatch(reviewTx({
    //     tx: tx,
    //     info: {
    //       counterparties: [ownProps.subscription.hostname,],
    //       values: [web3js.utils.toWei(amount.toString()),],
    //     }
    //   }))
    // })
  }
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Donate)
