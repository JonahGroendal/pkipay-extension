import React from 'react';
import { connect } from 'react-redux'
import InputTokenAmount from '../components/InputTokenAmount'
import { reviewTx } from '../actions'
import { createTxTransfer, createTxTransferETH, addresses, domainNameToEnsAddr, resolveAddress, resolveToken } from '../api/blockchain'

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

const tokenOptions = ['DAI', 'ETH', 'tokens']

function Donate({ domainName, ...mapped }) {
  const [token, setToken] = React.useState(tokenOptions[0])
  const [amount, setAmount] = React.useState('')
  const parsedAmount = isNaN(amount)
    ? 0
    : Number(amount)
  const address = useEnsResolver(domainName)
  const tokenAddress = useEnsTokenResolver(domainName, token)

  function handleChangeAmount(amount) {
    if (amount === '.' || !isNaN(amount))
      setAmount(amount)
  }

  function handleClickButton() {
    switch (token) {
      case 'ETH':
        return mapped.onTransferETH(mapped.address, domainName, parsedAmount)
      case 'tokens':
        return mapped.onTransfer(mapped.address, domainName, tokenAddress, parsedAmount, token)
      default:
        return mapped.onTransfer(mapped.address, domainName, addresses[token], parsedAmount, token)
    }
  }

  return React.createElement(InputTokenAmount, {
    amount,
    onChangeAmount: handleChangeAmount,
    tokenOptions,
    token,
    onChangeToken: setToken,
    onClickButton: handleClickButton,
    buttonText: "Donate",
    buttonDisabled: address === ZERO_ADDRESS || parsedAmount <= 0 || (token === 'tokens' && tokenAddress === ZERO_ADDRESS),
    tooltip: address !== ZERO_ADDRESS ? "Donate to ".concat(domainName) : domainName.concat(" isn't signed up yet"),
  })
}

function useEnsResolver(domainName) {
  const [address, setAddress] = React.useState(ZERO_ADDRESS)
  React.useEffect(() => {
    if (domainName) {
      domainNameToEnsAddr(domainName)
      .then(resolveAddress)
      .then(setAddress)
      .catch(() => { /* Ignore "no resolver" error */ })
    } else {
      setAddress(ZERO_ADDRESS)
    }
  }, [domainName])
  return address
}

function useEnsTokenResolver(domainName, token) {
  const [tokenAddress, setTokenAddress] = React.useState(ZERO_ADDRESS)
  React.useEffect(() => {
    if (domainName && token === 'tokens') {
      domainNameToEnsAddr(domainName)
      .then(resolveToken)
      .then(setTokenAddress)
      .catch(() => {
        // No resolver set
        setTokenAddress(ZERO_ADDRESS)
      })
    }
  }, [domainName, token])
  return tokenAddress
}

const mapStateToProps = state => ({
  currency: state.settings['Currency'],
  address: state.wallet.addresses[state.wallet.defaultAccount]
})
const mapDispatchToProps = (dispatch) => ({
  onTransfer: async (from, domainName, tokenAddress, amount, tokenSymbol) => {
    const tx = await createTxTransfer(from, domainName, tokenAddress, amount)
    dispatch(reviewTx([tx], [domainName], [{ [tokenSymbol]: amount*-1 }]))
  },
  onTransferETH: async (from, domainName, amount) => {
    const tx = await createTxTransferETH(from, domainName, amount)
    dispatch(reviewTx([tx], [domainName], [{ 'ETH': amount*-1 }]))
  }
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Donate)
