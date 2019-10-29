import React from 'react';
import { connect } from 'react-redux'
import PresentationalComponent from '../components/Balances'
import { getTokenBalances, getBalanceETH, getBalanceDAI } from '../api/blockchain'

function Balances({ address, tokens, txScreenOpen, tabIndex }) {
  const tokenBalances = useTokenBalances(address, tokens, txScreenOpen, tabIndex)
  const ethBalance = useEthBalance(address, txScreenOpen, tabIndex)
  const daiBalance = useDaiBalance(address, txScreenOpen, tabIndex)

  return React.createElement(PresentationalComponent, {
    balances: [ethBalance, daiBalance, ...tokenBalances]
  })
}

const mapStateToProps = state => ({
  address: state.wallet.addresses[state.wallet.defaultAccount],
  tokens: state.wallet.tokens,
  txScreenOpen: state.transactionScreen.isOpen,
  tabIndex: state.pages.tabIndex
})

export default connect(mapStateToProps)(Balances)


function useTokenBalances(address, tokens, txScreenOpen, tabIndex) {
  const [tokenBalances, setTokenBalances] = React.useState([])

  React.useEffect(() => {
    if (!txScreenOpen && address && tabIndex === 1)
      getTokenBalances(address, tokens).then(setTokenBalances)
  }, [txScreenOpen, address, tabIndex])

  return tokenBalances
}

function useEthBalance(address, txScreenOpen, tabIndex) {
  const [ethBalance, setEthBalance] = React.useState({ name: 'ETH', balance: 0 })

  React.useEffect(() => {
    if (!txScreenOpen && address && tabIndex === 1)
      getBalanceETH(address).then(balance => setEthBalance({ name: 'ETH', balance }))
  }, [txScreenOpen, address, tabIndex])

  return ethBalance
}

function useDaiBalance(address, txScreenOpen, tabIndex) {
  const [daiBalance, setDaiBalance] = React.useState({ name: 'DAI (USD)', balance: 0 })

  React.useEffect(() => {
    if (!txScreenOpen && address && tabIndex === 1)
      getBalanceDAI(address).then(balance => setDaiBalance({ name: 'DAI (USD)', balance }))
  }, [txScreenOpen, address, tabIndex])

  return daiBalance
}
