import React from 'react'
import { connect } from 'react-redux'
import PresentationalComponent from '../components/DEXSwapScreen'
import { reviewTx } from '../actions'
import { createTxSwap } from '../api/0xDEX'
import web3js from '../api/web3js'
import _ from 'lodash'

const orderTypeOptions = ['Buy', 'Sell']
const tokenOptions = ['DAI', 'ETH']

const debouncedCreateTxSwap = _.debounce(
  (params, callback) => {
    createTxSwap(params)
    .then(result => callback(result))
    .catch(console.error)
  },
  700
)

const initResultDetails = () => ({
  buyAmount: 0,
  sellAmount: 0,
  value: 0,
  price: 0,
  protocolFee: 0
})

function DEXSwapScreen({ open, onClose, address, reviewTx }) {
  const [orderType, setOrderType] = React.useState(orderTypeOptions[0])
  const [token, setToken] = React.useState(tokenOptions[0])
  const [amount, setAmount] = React.useState('')
  const [result, setResult] = React.useState(null)
  const [resultDetails, setResultDetails] = React.useState(initResultDetails())

  const { buyAmount, sellAmount, value, price, protocolFee } = resultDetails
  const otherToken = tokenOptions.find(t => t !== token)
  const amountIsValid = !isNaN(amount)

  React.useEffect(() => {
    setResult(null)
    setResultDetails(initResultDetails())
    if (amount && amountIsValid) {
      const params = {
        buyToken: orderType === 'Buy' ? token : otherToken,
        sellToken: orderType === 'Sell' ? token : otherToken,
        [orderType === 'Buy' ? 'buyAmount' : 'sellAmount']: web3js.utils.toWei(amount)
      }
      debouncedCreateTxSwap(params, result => {
        setResult(result)
        setResultDetails({
          buyAmount: result.buyAmount ? parseFloat(web3js.utils.fromWei(result.buyAmount)) : 0,
          sellAmount: result.sellAmount ? parseFloat(web3js.utils.fromWei(result.sellAmount)) : 0,
          value: result.value ? parseFloat(web3js.utils.fromWei(result.value)) : 0,
          price: result.price ? parseFloat(result.price) : 0,
          protocolFee: result.protocolFee ? parseFloat(web3js.utils.fromWei(result.protocolFee)) : 0
        })
      })
    }
  }, [orderType, token, amount])

  const totalReturnETH = (
    ((orderType === 'Buy' && token === 'ETH') || (orderType === 'Sell' && token === 'DAI'))
      ? buyAmount
      : 0
  )
  const totalCostETH = value
  const totalChangeETH = totalReturnETH - totalCostETH

  const totalReturnDAI = (
    ((orderType === 'Buy' && token === 'DAI') || (orderType === 'Sell' && token === 'ETH'))
      ? buyAmount
      : 0
  )
  const totalCostDAI = (
    ((orderType === 'Buy' && token === 'ETH') || (orderType === 'Sell' && token === 'DAI'))
      ? sellAmount
      : 0
  )
  const totalChangeDAI = totalReturnDAI - totalCostDAI

  const errorReasonExists = !!(result && result.code && result.validationErrors && result.validationErrors[0] && result.validationErrors[0].reason)

  return React.createElement(PresentationalComponent, {
    open,
    onClose,
    tokenOptions,
    token,
    otherToken,
    onChangeToken: setToken,
    amount,
    onChangeAmount: setAmount,
    amountError: !amountIsValid,
    dexError: errorReasonExists ? result.validationErrors[0].reason : '',
    submitButtonDisabled: !amountIsValid || !buyAmount,
    orderType,
    onChangeOrderType: setOrderType,
    orderTypeOptions,
    forAmount: `${(orderType === 'Buy' ? sellAmount : buyAmount).toFixed(otherToken === 'DAI' ? 3 : 6)} ${otherToken}`,
    price: `${price.toFixed(otherToken === 'DAI' ? 3 : 6)} ${otherToken} ⁄ ${token}`,
    protocolFee: `${protocolFee.toFixed(6)} ETH`,
    onClick: () => {
      reviewTx(result, { ETH: totalChangeETH, DAI: totalChangeDAI })
      onClose()
    }
  })
}

const mapStateToProps = state => ({
  address: state.wallet.addresses[state.wallet.defaultAccount]
})

const mapDispatchToProps = dispatch => ({
  reviewTx: async (tx, values) => {
    dispatch(reviewTx([tx], ["0x Decentralized Token Exchange"], [values]))
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(DEXSwapScreen)
