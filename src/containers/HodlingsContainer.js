import React from 'react';
import { connect } from 'react-redux'
import Hodlings from '../components/Hodlings'
import { getTokenBalances } from '../api/blockchain'

function HodlingsContainer({ address, txScreenOpen }) {
  const balances = useBalances(address, txScreenOpen)

  return React.createElement(Hodlings, { balances })
}

function useBalances(address, txScreenOpen) {
  const [balances, setBalances] = React.useState([])

  React.useEffect(() => {
    if (!txScreenOpen)
      getTokenBalances(address).then(setBalances)
  }, [txScreenOpen, address])

  return balances
}

const mapStateToProps = state => ({
  address: state.wallet.addresses[0],
  txScreenOpen: state.transactionScreen.isOpen
})

export default connect(mapStateToProps)(HodlingsContainer)
