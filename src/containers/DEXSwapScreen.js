import React from 'react'
import { connect } from 'react-redux'
import PresentationalComponent from '../components/DEXSwapScreen'
import { reviewTx } from '../actions'
import { createTxSwap } from '../api/0xDEX'
import web3js from '../api/web3js'
import { chainId, addresses, addressApproved, createTxApproveAddress, createTxExchangeWethForEth } from '../api/blockchain'
import _ from 'lodash'
import { getContractAddressesForChainOrThrow } from '@0x/contract-addresses';

const orderTypeOptions = ['Buy', 'Sell']
const tokenOptions = ['DAI', 'ETH']

const debouncedCreateTxSwap = _.debounce(
  (params, options, callback) => {
    createTxSwap(params, options)
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

  const [requestCount, setRequestCount] = React.useState(0)

  React.useEffect(() => {
    if (process.env.REACT_APP_ACTUAL_ENV !== 'production')
      console.log('result', result)
  }, [result])

  React.useEffect(() => {
    setResult(null)
    setResultDetails(initResultDetails())
    if (amount && amountIsValid) {
      const params = {
        buyToken: orderType === 'Buy' ? token : otherToken,
        sellToken: orderType === 'Sell' ? token : otherToken,
        // takerAddress: address,
        [orderType === 'Buy' ? 'buyAmount' : 'sellAmount']: web3js.utils.toWei(amount)
      }
      // ETH -> DAI works but DAI -> ETH is not supported. Must do DAI -> WETH then convert WETH -> ETH
      if (params.buyToken === 'ETH')
        params.buyToken = 'WETH'
      setRequestCount(thisRequestCount => {
        debouncedCreateTxSwap(params, { chainId }, result => {
            setRequestCount(currentRequestCount => {
              if (thisRequestCount === currentRequestCount - 1) {
                if (result.code < 200 || 300 <= result.code) {
                  // The request errored
                  // Don't `setResult`
                  console.error(result)
                } else {
                  setResult(result)
                  setResultDetails({
                    buyAmount: result.buyAmount ? parseFloat(web3js.utils.fromWei(result.buyAmount)) : 0,
                    sellAmount: result.sellAmount ? parseFloat(web3js.utils.fromWei(result.sellAmount)) : 0,
                    value: result.value ? parseFloat(web3js.utils.fromWei(result.value)) : 0,
                    price: result.price ? parseFloat(result.price) : 0,
                    protocolFee: result.protocolFee ? parseFloat(web3js.utils.fromWei(result.protocolFee)) : 0
                  })
                }
              }
              return currentRequestCount
            })
        })
        return thisRequestCount + 1
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
      reviewTx(result, { ETH: totalChangeETH, DAI: totalChangeDAI }, address)
      onClose()
    }
  })
}

const mapStateToProps = state => ({
  address: state.wallet.addresses[state.wallet.defaultAccount]
})

const mapDispatchToProps = dispatch => ({
  // TODO: test this and fix bugs. The 0x service wasn't working so I wasn't able to test.
  // ETH -> DAI most likely works but DAI -> ETH may not since theres a lot of untested code there
  reviewTx: async (result, values, from) => {
    const txs = []

    // If we're not selling ETH, we must be selling an ERC20 token, so an
    // `approve` transaction must be sent first.
    // note: if selling ETH, sellTokenAddress will be the WETH address
    if (result.sellTokenAddress.toLowerCase() !== addresses.WETH.toLowerCase()) {
      console.log('selling ERC20 token')
      const addressToApprove = getContractAddressesForChainOrThrow(chainId).erc20Proxy;
      if (!(await addressApproved(from, result.sellTokenAddress, addressToApprove))) {
        txs.push(createTxApproveAddress(from, result.sellTokenAddress, addressToApprove))
      }
    }

    txs.push({
      to: result.to,
      from,
      gas: result.gas,
      data: result.data,
      value: result.value,
      estimatedGas: result.estimatedGas,
      gasPrice: result.gasPrice
    })

    // If we're receiving WETH, include transaction to convert WETH to ETH
    if (result.buyTokenAddress.toLowerCase() === addresses.WETH.toLowerCase()) {
      console.log('buying ETH')
      txs.push(createTxExchangeWethForEth(from, result.buyAmount))
    }

    dispatch(reviewTx(txs, ["0x Decentralized Token Exchange"], [values]))
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(DEXSwapScreen)
