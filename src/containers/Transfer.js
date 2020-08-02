import React from 'react';
import { connect } from 'react-redux'
import PresentationalComponent from '../components/Transfer'
import { reviewTx } from '../actions'
import {
  createTxApproveAddress,
  createTxTransfer,
  createTxTransferETH,
  addresses,
  // domainNameToEnsName,
  // resolveAddress,
} from '../api/blockchain'
import web3js from '../api/web3js'

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

function Transfer({ ensAddress, firstInputRef, ...mapped }) {
  const [amount, setAmount] = React.useState('')
  const [amountError, setAmountError] = React.useState(false);
  const parsedAmount = isNaN(amount)
    ? 0
    : Number(amount)

  const tokenOptions = [...Object.keys(addresses)]

  const [token, setToken] = React.useState(tokenOptions[0])
  const [toAddress, setToAddress] = React.useState('')
  const [toAddressError, setToAddressError] = React.useState(false)

  const resetState = () => {
    setToAddress('')
    setToAddressError(false)
    setAmount('')
    setAmountError(false)
    setToken(tokenOptions[0])
  }

  function handleChangeAmount(amount) {
    if (amount === '.' || !isNaN(amount))
      setAmount(amount)
  }

  function handleClickButton() {
    const isValidAmount = parsedAmount !== 0
    const isValidToAddress = web3js.utils.isAddress(toAddress) && toAddress !== ZERO_ADDRESS

    if (isValidAmount)
      setAmountError(false)
    else {
      setAmountError(true)
    }
    if (isValidToAddress) {
      setToAddressError(false)
    } else {
      setToAddressError(true)
    }

    if (isValidAmount && isValidToAddress) {
      if (token === 'ETH')
        mapped.onTransferETH(mapped.address, toAddress, parsedAmount)
      else
        mapped.onTransfer(mapped.address, toAddress, parsedAmount, addresses[token], token)

      resetState()
    }
  }

  function tooltip() {
    if (!toAddress)
      return ''
    else
      return "Send ".concat(parsedAmount.toFixed(3), " ", token, " to ", toAddress)
  }

  return React.createElement(PresentationalComponent, {
    amount,
    onChangeAmount: handleChangeAmount,
    amountError,
    tokenOptions,
    toAddress,
    toAddressError,
    token,
    onChangeToAddress: setToAddress,
    onChangeToken: setToken,
    onClickButton: handleClickButton,
    tooltip: tooltip(),
    firstInputRef
  })
}

const mapStateToProps = state => ({
  currency: state.settings['Currency'],
  address: state.wallet.addresses[state.wallet.defaultAccount]
})
const mapDispatchToProps = (dispatch) => ({
  onTransfer: (from, toAddress, amount, tokenAddr, tokenSymbol) => {
    const txs = [
      createTxApproveAddress(from, tokenAddr, toAddress),
      createTxTransfer(from, toAddress, tokenAddr, amount)
    ]
    dispatch(reviewTx(txs, [toAddress], [{ [tokenSymbol]: amount*-1 }]))
  },
  onTransferETH: (from, toAddress, amount) => {
    const tx = createTxTransferETH(from, toAddress, amount)
    dispatch(reviewTx([tx], [toAddress], [{ 'ETH': amount*-1 }]))
  }
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Transfer)
