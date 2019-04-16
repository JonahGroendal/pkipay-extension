import React from 'react';
import { connect } from 'react-redux'
import PresentationalComponent from '../components/Hodlings'
import { getTokenBalances } from '../api/blockchain'

function Hodlings({ address, txScreenOpen }) {
  const balances = useBalances(address, txScreenOpen)

  return React.createElement(PresentationalComponent, { balances })
}

function useBalances(address, txScreenOpen) {
  const [balances, setBalances] = React.useState([])

  React.useEffect(() => {
    if (!txScreenOpen && address)
      getTokenBalances(address).then(setBalances)
  }, [txScreenOpen, address])

  return balances
}

const mapStateToProps = state => ({
  address: state.wallet.addresses[state.wallet.defaultAccount],
  txScreenOpen: state.transactionScreen.isOpen
})

export default connect(mapStateToProps)(Hodlings)
