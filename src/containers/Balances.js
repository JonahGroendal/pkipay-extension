import React from 'react';
import { connect } from 'react-redux'
import PresentationalComponent from '../components/Balances'
import { getTokenBalance, getBalanceETH, getBalanceDAI, getTokenName, getTokenSymbol, resolveToken, scanForTokens } from '../api/blockchain'
import { setTarget, addToken, completeTokenScan } from '../actions'

function Balances(props) {
  const {
    onChangeIndex,
    address,
    tokens,
    addToken,
    tokenScanComplete,
    completeTokenScan,
    txScreenOpen,
    tabIndex,
    setTarget
  } = props

  const tokenBalances = useTokenBalances(address, tokens, txScreenOpen, tabIndex)
  const ethBalance = useEthBalance(address, txScreenOpen, tabIndex)
  const daiBalance = useDaiBalance(address, txScreenOpen, tabIndex)

  React.useEffect(() => {
    if (!tokenScanComplete && address) {
      scanForTokens(address)
      .then(tokenAddrs => {
        tokenAddrs.forEach(addToken)
        completeTokenScan()
      })
    }
  }, [address])

  return React.createElement(PresentationalComponent, {
    balances: [ethBalance, daiBalance, ...tokenBalances],
    onClickBalance: address => {setTarget(address.replace('.dnsroot.eth', '').replace('.dnsroot.test', '')); onChangeIndex(0)},
  })
}

const mapStateToProps = state => ({
  address: state.wallet.addresses[state.wallet.defaultAccount],
  tokens: state.wallet.tokens,
  tokenScanComplete: state.wallet.tokenScanComplete,
  txScreenOpen: state.transactionScreen.isOpen,
  tabIndex: state.pages.tabIndex
})

const mapDispatchToProps = dispatch => ({
  setTarget: target => dispatch(setTarget(target)),
  addToken: tokenAddr => dispatch(addToken(tokenAddr)),
  completeTokenScan: () => dispatch(completeTokenScan())
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Balances)


function useTokenBalances(address, tokens, txScreenOpen, tabIndex) {
  const [tokenBalances, setTokenBalances] = React.useState([])
  React.useEffect(() => {
    if (!txScreenOpen && address && tabIndex === 1) {
      Promise.all(tokens.map(ensAddress => resolveToken(ensAddress, { usePublicResolver: true })))
      .then(tokenAddrs => {
        return Promise.all(tokenAddrs.map(tokenAddr => (
          (tokenAddr && tokenAddr !== '0x0000000000000000000000000000000000000000')
            ? getTokenBalance(address, tokenAddr)
            : 0
        )))
        .then(balances => {
          return Promise.all([
            balances,
            Promise.all(tokenAddrs.map((v, i) => (
              (balances[i] > 0)
                ? getTokenName(tokenAddrs[i])
                : ''
            ))),
            Promise.all(tokenAddrs.map((v, i) => (
              (balances[i] > 0)
                ? getTokenSymbol(tokenAddrs[i])
                : ''
            )))
          ])
          .then(([balances, names, symbols]) => {
            const results = []
            tokenAddrs.forEach((v, i) => {
              if (balances[i] > 0)
                results.push({
                  name: names[i] ? names[i] : tokens[i],
                  symbol: symbols[i],
                  balance: balances[i]
                })
            })
            return results
          })
        })
      })
      .then(tokenDetailsObjs => {
        setTokenBalances(tokenDetailsObjs)
      })
    }
  }, [txScreenOpen, address, tabIndex, tokens])

  return tokenBalances
}

function useEthBalance(address, txScreenOpen, tabIndex) {
  const [ethBalance, setEthBalance] = React.useState({
    name: 'Ether',
    symbol: 'ETH',
    balance: 0
  })

  React.useEffect(() => {
    if (!txScreenOpen && address && tabIndex === 1)
      getBalanceETH(address)
      .then(balance => setEthBalance(prev => ({ ...prev, balance })))
  }, [txScreenOpen, address, tabIndex])

  return ethBalance
}

function useDaiBalance(address, txScreenOpen, tabIndex) {
  const [daiBalance, setDaiBalance] = React.useState({
    name: 'Dai Stablecoin',
    symbol: 'DAI',
    balance: 0
  })

  React.useEffect(() => {
    if (!txScreenOpen && address && tabIndex === 1)
      getBalanceDAI(address)
      .then(balance => setDaiBalance(prev => ({ ...prev, balance })))
  }, [txScreenOpen, address, tabIndex])

  return daiBalance
}
