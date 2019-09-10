import React from 'react';
import { connect } from 'react-redux'
import InputTokenAmount from '../components/InputTokenAmount'
import currencySymbols from '../api/currencySymbols'
import { reviewTx } from '../actions'
import { createTxTransfer, createTxTransferETH, addresses, resolveAddress, domainNameToEnsAddr } from '../api/blockchain'
import { convertToUSD } from '../api/ECBForexRates'

const tokenOptions = ['DAI', 'ETH']

function Donate({ domainName, ...mapped }) {
  const [token, setToken] = React.useState(tokenOptions[0])
  const [amount, setAmount] = React.useState('')
  const address = useEnsResolver(domainName)
  const parsedAmount = isNaN(amount)
    ? 0
    : Number(amount)


  function handleChangeAmount(amount) {
    if (amount === '.' || !isNaN(amount))
      setAmount(amount)
  }

  function handleClickButton() {
    if (token === 'ETH')
      mapped.onTransferETH(mapped.address, domainName, parsedAmount)
    else
      mapped.onTransfer(mapped.address, domainName, addresses[token], parsedAmount, token)
  }

  return React.createElement(InputTokenAmount, {
    amount,
    onChangeAmount: handleChangeAmount,
    tokenOptions,
    token,
    onChangeToken: setToken,
    onClickButton: handleClickButton,
    buttonText: "Donate",
    buttonDisabled: domainName === '' || parsedAmount <= 0 || address === '0x0000000000000000000000000000000000000000',
    tooltip: "Donate to " + domainName,
  })
}

function useEnsResolver(domainName) {
  const [address, setAddress] = React.useState('0x0000000000000000000000000000000000000000')
  React.useEffect(() => {
    if (domainName) {
      domainNameToEnsAddr(domainName)
      .then(resolveAddress)
      .then(setAddress)
      .catch(() => { /* Ignore "no resolver" error */ })
    } else {
      setAddress('0x0000000000000000000000000000000000000000')
    }
  }, [domainName])
  return address
}

const mapStateToProps = state => ({
  currency: state.settings['Currency'],
  address: state.wallet.addresses[state.wallet.defaultAccount]
})
const mapDispatchToProps = (dispatch) => ({
  onTransfer: async (from, domainName, tokenAddr, amount, tokenSymbol) => {
    const tx = await createTxTransfer(from, domainName, tokenAddr, amount)
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
