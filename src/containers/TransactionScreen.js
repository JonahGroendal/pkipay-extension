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
    onSend,
    onClickCancel,
    onClickClose,
    onClickOpen,
    onTxConfirmation,
    currency,
  } = props
  let { txObjects } = props;

  const gasValues = useGasValues(txObjects)

  React.useEffect(() => {
    if (isOpen && !txConfirmed && txHash !== null) {
      const interval = setInterval(() => {
        web3js.eth.getTransactionReceipt(txHash).then(receipt => {
          if (receipt && receipt.status && !txConfirmed) onTxConfirmation()
        })
      }, 3000)
      return () => clearInterval(interval)
    }
  }, [isOpen, txConfirmed, txHash])

  return React.createElement(PresentationalComponent, {
    isOpen,
    counterparties,
    values,
    gasValue: convertFromUSD(currency, gasValues.USD),
    gasValueETH: gasValues.ETH,
    txSent: (txHash !== null || txError !== null),
    txConfirmed,
    txErrored: txError !== null,
    onClickSend: () => onSend(txObjects, counterparties, values),
    onClickCancel,
    onClickClose,
    onClickOpen,
    currencySymbol: strings.currency[currency],
    badgeInvisible: (txObjects === null || txHash !== null),
    txObjectExists: txObjects !== null && txObjects.length > 0
  })
}

function useGasValues(txObjects) {
  const [gasValues, setGasValues] = React.useState({ USD: 0, ETH: 0 })
  React.useEffect(() => {
    setGasValues({ USD: 0, ETH: 0 }); // First reset
    if (txObjects !== null) {
      Promise.all(txObjects.map(txObject => web3js.eth.estimateGas(txObject)))
      .then(gasEstimates => {
        console.log(gasEstimates)
        cryptoCompare.setApiKey('ef0e18b0c977b89105af46b14aaf52ec25310df3d95fd7c971d4c5ee4fcf1b25')
        cryptoCompare.price('ETH', 'USD')
        .then(currencyPerEth => {
          let gasPrice;
          return Promise.all(txObjects.map(txObject => {
            if (txObject.gasPrice)
              return txObject.gasPrice;
            if (typeof gasPrice === 'undefined')
              gasPrice = web3js.eth.getGasPrice();
            return gasPrice;
          }))
          .then(gasPrices => {
            const gasValueETH = gasEstimates.map((ge, i) => parseFloat(web3js.utils.fromWei(web3js.utils.toBN(ge).mul(web3js.utils.toBN(gasPrices[i])).toString()))).reduce((acc, cur) => acc + cur, 0)
            const gasValueUSD = gasValueETH * currencyPerEth['USD']
            setGasValues({
              ETH: gasValueETH,
              USD: gasValueUSD
            })
          })
        })
      })
      .catch(console.log)
    }
  }, [txObjects])

  return gasValues
}

const mapStateToProps = state => ({
  isOpen:         state.transactionScreen.isOpen,
  counterparties: state.transactionScreen.counterparties,
  values:         state.transactionScreen.values,
  txHash:         state.transactionScreen.txHash,
  txError:        state.transactionScreen.txError,
  txConfirmed:    state.transactionScreen.txConfirmed,
  txObjects:      state.transactionScreen.txObjects,
  currency:       state.settings.currency,
})

const mapDispatchToProps = (dispatch, ownProps) => ({
  onSend: (txObjects, counterparties, values) => dispatch(sendTx(txObjects, counterparties, values)),
  onClickCancel: () => dispatch(cancelTx()),
  onClickClose: () => dispatch(closeTx()),
  onClickOpen: () => dispatch(openTx()),
  onTxConfirmation: () => dispatch(confirmTx())
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TransactionScreen)
