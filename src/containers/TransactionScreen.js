import React from 'react'
import { connect } from 'react-redux'
import PresentationalComponent from '../components/TransactionScreen'
import { sendTx, cancelTx, closeTx, openTx, confirmTx } from '../actions'
import { convertFromUSD } from '../api/ECBForexRates'
import cryptoCompare from 'cryptocompare'
import web3js from '../api/web3js'
import strings from '../api/strings'

function TransactionScreen(props) {
  const {
    isOpen,
    counterparties,
    values,
    txHash,
    txError,
    txConfirmed,
    txObject,
    onSend,
    onClickCancel,
    onClickClose,
    onClickOpen,
    onTxConfirmation,
    currency,
  } = props

  const gasValues = useGasValues(txObject)

  React.useEffect(() => {
    if (isOpen && !txConfirmed && txHash !== null) {
      const interval = setInterval(() => {
        web3js.eth.getTransactionReceipt(txHash).then(receipt => {
          if (receipt && receipt.status) onTxConfirmation()
        })
      }, 3000)
      return () => clearInterval(interval)
    }
  }, [isOpen, txConfirmed, txHash])

  return React.createElement(PresentationalComponent, {
    isOpen,
    counterparties,
    values: values.map(val => convertFromUSD(currency, web3js.utils.fromWei(val))),
    gasValue: convertFromUSD(currency, gasValues.USD),
    gasValueETH: gasValues.ETH,
    txSent: (txHash !== null || txError !== null),
    txConfirmed,
    txErrored: txError !== null,
    onClickSend: () => onSend(txObject, counterparties).then(console.log),
    onClickCancel,
    onClickClose,
    onClickOpen,
    currencySymbol: strings.currency[currency],
    badgeInvisible: (txObject === null || txHash !== null),
    txObjectExists: !!txObject
  })
}

async function getGasPrice(txObject) {
  if (txObject.gasPrice) return txObject.gasPrice
  return await web3js.eth.getGasPrice()
}
function useGasValues(txObject) {
  const [gasValues, setGasValues] = React.useState({USD: 0, ETH: 0})
  React.useEffect(() => {
    if (txObject !== null) {
      web3js.eth.estimateGas(txObject)
      .then(gas => {
        cryptoCompare.setApiKey('ef0e18b0c977b89105af46b14aaf52ec25310df3d95fd7c971d4c5ee4fcf1b25')
        cryptoCompare.price('ETH', 'USD')
        .then(currencyPerEth => {
          getGasPrice(txObject).then(gasPrice => {
            const gasValueETH = parseFloat(web3js.utils.fromWei(web3js.utils.toBN(gas).mul(web3js.utils.toBN(gasPrice)).toString()))
            const gasValueUSD = gasValueETH * currencyPerEth['USD']
            setGasValues({ ETH: gasValueETH, USD: gasValueUSD})
          })
        })
      })
      .catch(() => {})
    }
  }, [txObject])

  return gasValues
}

const mapStateToProps = state => ({
  isOpen:         state.transactionScreen.isOpen,
  counterparties: state.transactionScreen.counterparties,
  values:         state.transactionScreen.values,
  txHash:         state.transactionScreen.txHash,
  txError:        state.transactionScreen.txError,
  txConfirmed:    state.transactionScreen.txConfirmed,
  txObject:       state.transactionScreen.txObject,
  currency:       state.settings.currency,
})

const mapDispatchToProps = (dispatch, ownProps) => ({
  onSend: (txObject, counterparties) => dispatch(sendTx(txObject, counterparties)),
  onClickCancel: () => dispatch(cancelTx()),
  onClickClose: () => dispatch(closeTx()),
  onClickOpen: () => dispatch(openTx()),
  onTxConfirmation: () => dispatch(confirmTx())
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TransactionScreen)
