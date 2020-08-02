import React from 'react';
import { connect } from 'react-redux'
import PresentationalComponent from '../components/Donate'
import { reviewTx, addCounterparty, addDonationSubscription, removeDonationSubscription } from '../actions'
import {
  apiContractApproved,
  createTxApproveApiContract,
  createTxDonate,
  createTxDonateETH,
  addresses,
  // domainNameToEnsName,
  // resolveAddress,
  /* old - not going into 1.0: resolveToken*/
} from '../api/blockchain'

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

const scheduleOptions = ['Once', 'Monthly']
const buttonText = {
  'Once': 'Donate',
  'Monthly': 'Subscribe'
}

function Donate({ ensAddress, onChangeTab, ...mapped }) {
  const [amount, setAmount] = React.useState('')
  const [error, setError] = React.useState(false);
  const parsedAmount = isNaN(amount)
    ? 0
    : Number(amount)
  // const address = useEnsResolver(domainName)

  const tokenOptions = [...Object.keys(addresses)]

  // old - not going into 1.0
  // const tokenAddress = useEnsTokenResolver(ensAddress)
  // const tokenAddresses = { ...addresses }
  // if (tokenAddress !== ZERO_ADDRESS) {
  //   tokenOptions.push('tokens')
  //   tokenAddresses['tokens'] = tokenAddress
  // }

  const [token, setToken] = React.useState(tokenOptions[0])
  const [schedule, setSchedule] = React.useState(scheduleOptions[0])

  const [buttonLoading, setButtonLoading] = React.useState(false);

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
          mapped.onDonateETH(mapped.address, ensAddress, parsedAmount)
        else
          mapped.onDonate(mapped.address, ensAddress, parsedAmount, addresses[token], token)
      }
      else if (schedule === 'Monthly') {
        if (!addresses[token]) {
          throw new Error('Unknown token')
        }
        setButtonLoading(true)
        mapped.onSubscribe(ensAddress, parsedAmount, addresses[token])
        .then(() => {
          onChangeTab(1)
          setAmount('')
          setToken(tokenOptions[0])
          setSchedule(scheduleOptions[0])
        })
        .finally(() => setButtonLoading(false))
      }
    }
  }

  function tooltip() {
    if (!ensAddress)
      return ''
    else if (schedule === 'Monthly')
      return "Donate ".concat(parsedAmount.toFixed(3), " ", token, " to ", ensAddress.replace('.dnsroot.eth', '').replace('.dnsroot.test', ''), ' once per month')
    else
      return "Donate ".concat(parsedAmount.toFixed(3), " ", token, " to ", ensAddress.replace('.dnsroot.eth', '').replace('.dnsroot.test', ''))
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
    buttonDisabled: !ensAddress/* old - not in 1.0: || (token === 'tokens' && tokenAddress === ZERO_ADDRESS)*/,
    buttonLoading,
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

// old - not going into 1.0:
// function useEnsTokenResolver(ensAddress) {
//   const [tokenAddress, setTokenAddress] = React.useState(ZERO_ADDRESS)
//   React.useEffect(() => {
//     if (ensAddress) {
//       resolveToken(ensAddress)
//       .then(setTokenAddress)
//       .catch(() => {
//         // No resolver set
//         setTokenAddress(ZERO_ADDRESS)
//       })
//     }
//   }, [ensAddress])
//   return tokenAddress
// }

const mapStateToProps = state => ({
  currency: state.settings['Currency'],
  address: state.wallet.addresses[state.wallet.defaultAccount]
})
const mapDispatchToProps = (dispatch) => ({
  onDonate: async (from, ensAddress, amount, tokenAddr, tokenSymbol) => {
    dispatch(addCounterparty(ensAddress))
    const txs = []
    const approved = await apiContractApproved(from, tokenAddr)
    if (!approved)
      txs.push(createTxApproveApiContract(from, tokenAddr))
    txs.push(createTxDonate(from, tokenAddr, ensAddress, amount))
    dispatch(reviewTx(txs, [ensAddress], [{ [tokenSymbol]: amount*-1 }]))
  },
  onDonateETH: (from, ensAddress, amount) => {
    dispatch(addCounterparty(ensAddress))
    const tx = createTxDonateETH(from, ensAddress, amount)
    dispatch(reviewTx([tx], [ensAddress], [{ 'ETH': amount*-1 }]))
  },
  onSubscribe: async (ensAddress, amount, tokenAddr) => {
    await dispatch(removeDonationSubscription(ensAddress, tokenAddr, false))
    await dispatch(addDonationSubscription(ensAddress, amount, tokenAddr))
  }
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Donate)
