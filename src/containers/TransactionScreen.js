import React from 'react'
import { connect } from 'react-redux'
import PresentationalComponent from '../components/TransactionScreen'
import { sendTx, cancelTx, closeTx, openTx, txConfirmed, txReverted } from '../actions'
import { getPriceOfETHInUSD } from '../api/blockchain'
import { getUsdExchangeRate } from '../api/ECBForexRates'
// import cryptoCompare from 'cryptocompare'
import web3js from '../api/web3js'
import currencySymbols from '../api/currencySymbols'

function TransactionScreen(props) {
  const {
    isOpen,
    counterparties,
    values,
    txHashes,
    txError,
    txReverted,
    txConfirmed,
    onSend,
    onClickCancel,
    onClickClose,
    onClickOpen,
    onTxConfirmation,
    onTxRevert,
    currency,
  } = props
  let { txObjects } = props;

  const gasValues = useGasValues(txObjects)

  React.useEffect(() => {
    if (isOpen && !txConfirmed && !txReverted && txHashes !== null) {
      const interval = setInterval(() => {
        web3js.eth.getTransactionReceipt(txHashes[txHashes.length-1]).then(receipt => {
          console.log('receipt', receipt)
          if (receipt && !txConfirmed && !txReverted) {
            if (receipt.status)
              onTxConfirmation()
            else
              onTxRevert()
          }
        })
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [isOpen, txConfirmed, txReverted, txHashes])

  const [usdExchangeRate, setUsdExchangeRate] = React.useState(0)
  React.useEffect(() => {
    if (currency) {
      getUsdExchangeRate(currency).then(setUsdExchangeRate)
    }
  }, [currency])

  return React.createElement(PresentationalComponent, {
    isOpen,
    counterparties,
    values,
    gasValue: usdExchangeRate * gasValues.USD,
    gasValueETH: gasValues.ETH,
    gasValueIsApproximation: gasValues.isApproximation,
    txSent: (txHashes !== null || txError !== null),
    txConfirmed,
    txErrored: txError !== null,
    txReverted,
    onClickSend: () => onSend(txObjects),
    onClickCancel,
    onClickClose,
    onClickOpen,
    currencySymbol: currencySymbols[currency],
    badgeInvisible: (txObjects === null || txHashes !== null),
    txObjectExists: txObjects !== null && txObjects.length > 0,
    invalidCounterpartyExists: counterparties.some(c => c.charAt(0) === '.')
  })
}

const mapStateToProps = state => ({
  isOpen:         state.transactionScreen.isOpen,
  counterparties: state.transactionScreen.counterparties,
  values:         state.transactionScreen.values,
  txHashes:       state.transactionScreen.txHashes,
  txError:        state.transactionScreen.txError,
  txReverted:     state.transactionScreen.txReverted,
  txConfirmed:    state.transactionScreen.txConfirmed,
  txObjects:      state.transactionScreen.txObjects,
  currency:       state.settings['Currency'],
})

const mapDispatchToProps = (dispatch, ownProps) => ({
  onSend: txObjects => dispatch(sendTx(txObjects)),
  onClickCancel: () => dispatch(cancelTx()),
  onClickClose: () => dispatch(closeTx()),
  onClickOpen: () => dispatch(openTx()),
  onTxConfirmation: () => dispatch(txConfirmed()),
  onTxRevert: () => dispatch(txReverted())
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TransactionScreen)


function useGasValues(txObjects) {
  const [isApproximation, setIsApproximation] = React.useState(0)
  const [gasValueETH, setGasValueETH] = React.useState(0)
  const [gasValueUSD, setGasValueUSD] = React.useState(0)

  React.useEffect(() => {
    if (txObjects === null) {
      setGasValueETH(0)
      setGasValueUSD(0)
    } else {
      let isApprox = false
      Promise.all(txObjects.map(txObject => web3js.eth.estimateGas(txObject).catch(() => {
        isApprox = true;
        return Number(txObject.estimatedGas ? txObject.estimatedGas : txObject.gas)
      })))
      .then(gasEstimates => {
        // cryptoCompare.setApiKey('ef0e18b0c977b89105af46b14aaf52ec25310df3d95fd7c971d4c5ee4fcf1b25')
        // cryptoCompare.price('ETH', 'USD')
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
          setGasValueETH(gasValueETH)
          setIsApproximation(isApprox)

          getPriceOfETHInUSD()
          .then(usdPerEth => {
            setGasValueUSD(gasValueETH * usdPerEth)
          })
          .catch(error => {
            setGasValueUSD(0)
            console.error(error);
          })
        })
      })
      .catch(error => {
        setGasValueETH(0)
        setGasValueUSD(0)
        console.error(error);
      })
    }
  }, [txObjects])

  return {
    ETH: gasValueETH,
    USD: gasValueUSD,
    isApproximation
  }
}
