import React from 'react';
import { connect } from 'react-redux'
import PresentationalComponent from '../components/Balances'
import { getTokenBalances, getBalanceETH, getBalanceDAI } from '../api/blockchain'

function Balances({ address, tokens, txScreenOpen }) {
  const tokenBalances = useTokenBalances(address, tokens, txScreenOpen)
  const ethBalance = useEthBalance(address, txScreenOpen)
  const daiBalance = useDaiBalance(address, txScreenOpen)

  return React.createElement(PresentationalComponent, {
    balances: [ethBalance, daiBalance, ...tokenBalances]
  })
}

function useTokenBalances(address, tokens, txScreenOpen) {
  const [tokenBalances, setTokenBalances] = React.useState([])

  React.useEffect(() => {
    if (!txScreenOpen && address)
      getTokenBalances(address, tokens).then(setTokenBalances)
  }, [txScreenOpen, address])

  return tokenBalances
}

function useEthBalance(address, txScreenOpen) {
  const [ethBalance, setEthBalance] = React.useState({ name: 'ETH', balance: 0 })

  React.useEffect(() => {
    if (!txScreenOpen && address)
      getBalanceETH(address).then(balance => setEthBalance({ name: 'ETH', balance }))
  }, [txScreenOpen, address])

  return ethBalance
}

function useDaiBalance(address, txScreenOpen) {
  const [daiBalance, setDaiBalance] = React.useState({ name: 'USD (DAI)', balance: 0 })

  React.useEffect(() => {
    if (!txScreenOpen && address)
      getBalanceDAI(address).then(balance => setDaiBalance({ name: 'USD (DAI)', balance }))
  }, [txScreenOpen, address])

  return daiBalance
}

const mapStateToProps = state => ({
  address: state.wallet.addresses[state.wallet.defaultAccount],
  tokens: state.wallet.tokens,
  txScreenOpen: state.transactionScreen.isOpen
})

export default connect(mapStateToProps)(Balances)
