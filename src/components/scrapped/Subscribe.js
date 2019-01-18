import React from 'react';
import { connect } from 'react-redux'
import InputAmount from '../components/InputAmount'
import { buyTHX } from '../api/blockchain'
import web3js from '../api/web3js'
import strings from '../api/strings'
import { reviewTx, addSubscription } from '../actions'

function Subscribe({ subscribe, currency, subscription }) {
  const [amount, setAmount] = React.useState(2.0);

  const currencySymbol = strings.currency[currency];
  const onChange = e => setAmount(e.target.value)
  const onClick = () => subscribe(subscription)

  return React.createElement(InputAmount, {
    amount,
    currencySymbol,
    onChange,
    onClick,
    buttonText: "Subscribe"
  })
}

const mapStateToProps = state => ({
  currency: state.settings.currency,
})
const mapDispatchToProps = (dispatch, ownProps) => ({
  subscribe: subscription => dispatch(addSubscription(subscription)),
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Subscribe)
