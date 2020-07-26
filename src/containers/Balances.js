import React from 'react';
import { connect } from 'react-redux'
import PresentationalComponent from '../components/Balances'
import { getTokenBalance, getBalanceETH, getBalanceDAI, getTokenName, getTokenSymbol, /* old - not going into 1.0: resolveToken, scanForTokens, */domainNameToEnsName } from '../api/blockchain'
import { setTarget, addToken, removeToken, completeTokenScan } from '../actions'
import { isDomainName, isEnsName, isEnsNode } from '../api/utils'
import namehash from 'eth-ens-namehash'

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
    target,
    setTarget
  } = props

  // old - not going into 1.0
  // const tokenBalances = useTokenBalances(address, tokens, txScreenOpen, tabIndex)
  const ethBalance = useEthBalance(address, txScreenOpen, tabIndex)
  const daiBalance = useDaiBalance(address, txScreenOpen, tabIndex)

  const [dexScreenOpen, setDexScreenOpen] = React.useState(false)

  // old - not going into 1.0 - note: if you remove this code in the future, be sure to remove its vestigaes as well like `addToken`and `tokenScanComplete`. I didn't bother commenting them out
  // // If the app's data get's wiped, this will run once to look for tokens
  // React.useEffect(() => {
  //   if (!tokenScanComplete && address) {
  //     scanForTokens(address)
  //     .then(tokenAddrs => {
  //       tokenAddrs.forEach(addToken)
  //       completeTokenScan()
  //     })
  //   }
  // }, [address])
  //
  // // In case the ENS names of some tokens are not known (but only its namehash
  // // is known), as is the case after the above useEffect hook runs, this method
  // // will check if the current target is a token
  // React.useEffect(() => {
  //   if (target && isDomainName(target)) {
  //     const ensName = domainNameToEnsName(target.split('.').slice(-2).join('.'))
  //     const ensNode = namehash.hash(ensName)
  //     if (tokens.includes(ensNode)) {
  //       addToken(ensName)
  //       removeToken(ensNode)
  //     }
  //   }
  // }, [target, tokens])

  return React.createElement(PresentationalComponent, {
    balances: [ethBalance, daiBalance/*, old - not going into 1.0: ...tokenBalances*/],
    onClickBalance: name => {
      if (name === 'Ether' || name === "Dai Stablecoin") {
        setDexScreenOpen(true)
      }
      else if (isEnsName(name) || isEnsNode(name)) {
        setTarget(name.replace('.dnsroot.eth', '').replace('.dnsroot.test', ''))
        onChangeIndex(0)
      }
    },
    onClickExchange: () => setDexScreenOpen(true),
    dexScreenOpen,
    onCloseDexScreen: () => setDexScreenOpen(false)
  })
}

const mapStateToProps = state => ({
  address: state.wallet.addresses[state.wallet.defaultAccount],
  tokens: state.wallet.tokens,
  tokenScanComplete: state.wallet.tokenScanComplete,
  txScreenOpen: state.transactionScreen.isOpen,
  tabIndex: state.pages.tabIndex,
  target: state.target
})

const mapDispatchToProps = dispatch => ({
  setTarget: target => dispatch(setTarget(target)),
  addToken: tokenAddr => dispatch(addToken(tokenAddr)),
  removeToken: tokenAddr => dispatch(removeToken(tokenAddr)),
  completeTokenScan: () => dispatch(completeTokenScan())
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Balances)

// old - not going into 1.0
// function useTokenBalances(address, tokens, txScreenOpen, tabIndex) {
//   const [tokenBalances, setTokenBalances] = React.useState([])
//   React.useEffect(() => {
//     if (!txScreenOpen && address && tabIndex === 1) {
//       Promise.all(tokens.map(ensAddress => resolveToken(ensAddress, { usePublicResolver: true })))
//       .then(tokenAddrs => {
//         return Promise.all(tokenAddrs.map(tokenAddr => (
//           (tokenAddr && tokenAddr !== '0x0000000000000000000000000000000000000000')
//             ? getTokenBalance(address, tokenAddr)
//             : 0
//         )))
//         .then(balances => {
//           return Promise.all([
//             balances,
//             Promise.all(tokenAddrs.map((v, i) => (
//               (balances[i] > 0)
//                 ? getTokenName(tokenAddrs[i])
//                 : ''
//             ))),
//             Promise.all(tokenAddrs.map((v, i) => (
//               (balances[i] > 0)
//                 ? getTokenSymbol(tokenAddrs[i])
//                 : ''
//             )))
//           ])
//           .then(([balances, names, symbols]) => {
//             const results = []
//             tokenAddrs.forEach((v, i) => {
//               if (balances[i] > 0)
//                 results.push({
//                   name: names[i] ? names[i] : tokens[i],
//                   symbol: symbols[i],
//                   balance: balances[i]
//                 })
//             })
//             return results
//           })
//         })
//       })
//       .then(tokenDetailsObjs => {
//         setTokenBalances(tokenDetailsObjs)
//       })
//     }
//   }, [txScreenOpen, address, tabIndex, tokens])
//
//   return tokenBalances
// }

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
