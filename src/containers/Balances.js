import React from 'react';
import { connect } from 'react-redux'
import PresentationalComponent from '../components/Balances'
import { getBalanceERC20, getBalanceDAI, getTokenName, getTokenSymbol, domainNameToEnsName /* old - not going into 1.0: , resolveToken, scanForTokens, getTokenBalance*/} from '../api/blockchain'
import { setTarget, addToken, removeToken, completeTokenScan } from '../actions'
import { isDomainName, isEnsName, isEnsNode } from '../api/utils'
import namehash from 'eth-ens-namehash'

function Balances(props) {
  const {
    ethBalance,
    onClickAddFunds,
    onChangeTab,
    address,
    // old - not going into 1.0: tokens,
    // old - not going into 1.0: addToken,
    addedTokens,
    removeToken,
    tokenScanComplete,
    completeTokenScan,
    txScreenOpen,
    inView,
    target,
    setTarget
  } = props

  // old - not going into 1.0
  // const tokenBalances = useTokenBalances(address, tokens, txScreenOpen, inView)

  const ethBalanceObj = useEthBalance(ethBalance)
  const daiBalanceObj = useDaiBalance(address, txScreenOpen, inView)
  const addedTokenObjBalances = useAddedTokenBalances(address, addedTokens, txScreenOpen, inView)

  const [dexScreenOpen, setDexScreenOpen] = React.useState(false)

  const handleClickRemoveToken = tokenAddr => {
    removeToken(tokenAddr)
  }

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
    onClickAddFunds,
    onClickRemoveToken: handleClickRemoveToken,
    balances: [ethBalanceObj, daiBalanceObj, ...addedTokenObjBalances/*, old - not going into 1.0: ...tokenBalances*/],
    onClickBalance: name => {
      if (name === 'Ether' || name === "Dai Stablecoin") {
        setDexScreenOpen(true)
      }
      else if (isEnsName(name) || isEnsNode(name)) {
        setTarget(name.replace('.dnsroot.eth', '').replace('.dnsroot.test', ''))
        onChangeTab(0)
      }
    },
    onClickExchange: () => setDexScreenOpen(true),
    dexScreenOpen,
    onCloseDexScreen: () => setDexScreenOpen(false)
  })
}

const mapStateToProps = state => ({
  address: state.wallet.addresses[state.wallet.defaultAccount],
  // old - not going into 1.0: tokens: state.wallet.tokens,
  // old - not going into 1.0: tokenScanComplete: state.wallet.tokenScanComplete,
  addedTokens: state.wallet.addedTokens,
  txScreenOpen: state.transactionScreen.isOpen,
  target: state.target
})

const mapDispatchToProps = dispatch => ({
  setTarget: target => dispatch(setTarget(target)),
  removeToken: address => dispatch(removeToken(address)),
  // old - not going into 1.0: addToken: tokenAddr => dispatch(addToken(tokenAddr)),
  // old - not going into 1.0: removeToken: tokenAddr => dispatch(removeToken(tokenAddr)),
  completeTokenScan: () => dispatch(completeTokenScan())
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Balances)

function useAddedTokenBalances(address, tokens, txScreenOpen, inView) {
  const [tokenBalances, setTokenBalances] = React.useState([])
  const [initialized, setInitialized] = React.useState(false)

  const getAndSetBalances = tokens => {
    Promise.all(tokens.map(token => getBalanceERC20(address, token.address)))
    .then(balances => {
      setTokenBalances(
        balances.map((balance, i) => ({
          name: tokens[i].name,
          symbol: tokens[i].symbol,
          address: tokens[i].address,
          balance
        }))
      )
    })
  }

  React.useEffect(() => {
    if (!initialized && address && inView) {
      getAndSetBalances(tokens)
      setInitialized(true)
    }
  }, [address, inView])

  React.useEffect(() => {
    if (initialized && !txScreenOpen)
      getAndSetBalances(tokens)
  }, [tokens, txScreenOpen])

  return tokenBalances
}

// old - not going into 1.0
// function useTokenBalances(address, tokens, txScreenOpen, inView) {
//   const [tokenBalances, setTokenBalances] = React.useState([])
//   React.useEffect(() => {
//     if (!txScreenOpen && address && inView) {
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
//   }, [txScreenOpen, address, inView, tokens])
//
//   return tokenBalances
// }

function useEthBalance(ethBalance) {
  return {
    name: 'Ether',
    symbol: 'ETH',
    balance: ethBalance
  }
}

function useDaiBalance(address, txScreenOpen, inView) {
  const [daiBalance, setDaiBalance] = React.useState(0)

  React.useEffect(() => {
    if (!daiBalance && address && inView)
      getBalanceDAI(address).then(setDaiBalance)
  }, [address, inView])

  React.useEffect(() => {
    if (daiBalance && !txScreenOpen)
      getBalanceDAI(address).then(setDaiBalance)
  }, [txScreenOpen])

  return {
    name: 'Dai Stablecoin',
    symbol: 'DAI',
    balance: daiBalance
  }
}
