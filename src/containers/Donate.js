import React from 'react';
import { connect } from 'react-redux'
import PresentationalComponent from '../components/Donate'
import { reviewTx, addSubscription, setTabIndex, addCounterparty } from '../actions'
import {
  apiContractApproved,
  createTxApproveApiContract,
  createTxDonate,
  createTxDonateETH,
  addresses,
  domainNameToEnsName,
  // resolveAddress,
  resolveToken
} from '../api/blockchain'

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

const scheduleOptions = ['Once', 'Monthly']
const buttonText = {
  'Once': 'Donate',
  'Monthly': 'Subscribe'
}

function Donate({ domainName, ...mapped }) {
  const [amount, setAmount] = React.useState('')
  const [error, setError] = React.useState(false);
  const parsedAmount = isNaN(amount)
    ? 0
    : Number(amount)
  // const address = useEnsResolver(domainName)
  const tokenAddress = useEnsTokenResolver(domainName)
  const tokenOptions = [...Object.keys(addresses)]
  const tokenAddresses = { ...addresses }
  if (tokenAddress !== ZERO_ADDRESS) {
    tokenOptions.push('tokens')
    tokenAddresses['tokens'] = tokenAddress
  }
  const [token, setToken] = React.useState(tokenOptions[0])
  const [schedule, setSchedule] = React.useState(scheduleOptions[0])

  function handleChangeAmount(amount) {
    if (amount === '.' || !isNaN(amount))
      setAmount(amount)
  }

  function handleClickButton() {
    if (parsedAmount !== 0)
      setError(false)
    if (parsedAmount === 0) {
      setError(true)
    }
    else {
      if (schedule === 'Once') {
        if (token === 'ETH')
          mapped.onDonateETH(mapped.address, domainName, parsedAmount)
        else
          mapped.onDonate(mapped.address, domainName, parsedAmount, addresses[token], token)
      }
      else if (schedule === 'Monthly') {
        // TODO
      }
    }
  }

  function tooltip() {
    if (!domainName)
      return ''
    else if (schedule === 'Monthly')
      return "Feature coming soon"
    else
      return "Donate ".concat(parsedAmount.toFixed(2), " ", token, " to ", domainName)
  }

  return React.createElement(PresentationalComponent, {
    amount,
    onChangeAmount: handleChangeAmount,
    error,
    tokenOptions,
    scheduleOptions,
    token,
    schedule,
    onChangeToken: setToken,
    onChangeSchedule: setSchedule,
    onClickButton: handleClickButton,
    buttonText: buttonText[schedule],
    buttonDisabled: (schedule === 'Monthly') || (token === 'tokens' && tokenAddress === ZERO_ADDRESS) || !domainName,
    tooltip: tooltip(),
  })
}

// function useEnsResolver(domainName) {
//   const [address, setAddress] = React.useState(ZERO_ADDRESS)
//   React.useEffect(() => {
//     if (domainName) {
//       const ensName = domainNameToEnsName(domainName)
//       resolveAddress(ensName)
//       .then(setAddress)
//     } else {
//       setAddress(ZERO_ADDRESS)
//     }
//   }, [domainName])
//   return address
// }

function useEnsTokenResolver(domainName) {
  const [tokenAddress, setTokenAddress] = React.useState(ZERO_ADDRESS)
  React.useEffect(() => {
    if (domainName) {
      resolveToken(domainNameToEnsName(domainName))
      .then(setTokenAddress)
      .catch(() => {
        // No resolver set
        setTokenAddress(ZERO_ADDRESS)
      })
    }
  }, [domainName])
  return tokenAddress
}

const mapStateToProps = state => ({
  currency: state.settings['Currency'],
  address: state.wallet.addresses[state.wallet.defaultAccount]
})
const mapDispatchToProps = (dispatch) => ({
  onDonate: async (from, domainName, amount, tokenAddr, tokenSymbol) => {
    const ensName = domainNameToEnsName(domainName)
    dispatch(addCounterparty(ensName))
    const txs = []
    const approved = await apiContractApproved(from, tokenAddr)
    if (!approved)
      txs.push(createTxApproveApiContract(from, tokenAddr))
    txs.push(createTxDonate(from, tokenAddr, ensName, amount))
    dispatch(reviewTx(txs, [ensName], [{ [tokenSymbol]: amount*-1 }]))
  },
  onDonateETH: (from, domainName, amount) => {
    const ensName = domainNameToEnsName(domainName)
    dispatch(addCounterparty(ensName))
    const tx = createTxDonateETH(from, ensName, amount)
    dispatch(reviewTx([tx], [ensName], [{ 'ETH': amount*-1 }]))
  },
  onSubscribe: (domainName, amount) => dispatch(addSubscription(domainNameToEnsName(domainName), amount)),
  onChangeTab: tabIndex => dispatch(setTabIndex(tabIndex))
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Donate)
