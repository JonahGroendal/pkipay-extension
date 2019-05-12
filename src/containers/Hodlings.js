import React from 'react';
import { connect } from 'react-redux'
import PresentationalComponent from '../components/Hodlings'
import { getTokenBalances } from '../api/blockchain'

function Hodlings({ address, tokens, txScreenOpen }) {
  const balances = useBalances(address, tokens, txScreenOpen)

  return React.createElement(PresentationalComponent, { balances })
}

function useBalances(address, tokens, txScreenOpen) {
  const [balances, setBalances] = React.useState([])

  React.useEffect(() => {
    if (!txScreenOpen && address)
      getTokenBalances(address, tokens).then(setBalances)
  }, [txScreenOpen, address])

  return balances
}

const mapStateToProps = state => ({
  address: state.wallet.addresses[state.wallet.defaultAccount],
  tokens: state.wallet.tokens,
  txScreenOpen: state.transactionScreen.isOpen
})

export default connect(mapStateToProps)(Hodlings)
