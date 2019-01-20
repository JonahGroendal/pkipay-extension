import web3js from '../api/web3js'
import browser from '../api/browser'
import strings from '../api/strings'
import { createTxBuyThx, depositAllCurrency } from '../api/blockchain'
import EthereumTx from 'ethereumjs-tx'

export const addSubscription = subscription => dispatch => {
  dispatch({
    type: 'ADD_SUBSCRIPTION',
    subscription
  })
   return dispatch(rescheduleSubscriptionsPayments())
}

export const removeSubscription = hostname => dispatch => {
  dispatch({
    type: 'REMOVE_SUBSCRIPTION',
    hostname
  })
  return dispatch(rescheduleSubscriptionsPayments())
}

export const setCurrency = currency => ({
  type: 'SET_CURRENCY',
  currency
});

export const setPaymentSchedule = paymentSchedule => ({
  type: 'SET_PAYMENT_SCHEDULE',
  paymentSchedule
});

export const setThemeType = themeType => ({
  type: 'SET_THEME_TYPE',
  themeType
});

export const setObjectHostname = objectHostname => ({
  type: 'SET_OBJECT_HOSTNAME',
  objectHostname
})

let resolveWalletUnlock;
let rejectWalletUnlock;

export const unlockWalletRequest = () => dispatch => {
  dispatch({ type: 'UNLOCK_WALLET_REQUEST' })

  return new Promise((resolve, reject) => {
    resolveWalletUnlock = resolve;
    rejectWalletUnlock = reject;
  })
}

export const unlockWallet = password => (dispatch, getState) => {
  const { keystores } = getState().wallet
  try {
    web3js.eth.accounts.wallet.decrypt(keystores, password)
  } catch (error) {
    return dispatch({ type: 'UNLOCK_WALLET_FAILURE' })
  }
  dispatch({ type: 'UNLOCK_WALLET_SUCCESS' })
  return resolveWalletUnlock()
}

export const unlockWalletCancel = () => dispatch => {
  dispatch({ type: 'UNLOCK_WALLET_CANCEL' })
  return rejectWalletUnlock()
}

export const createWallet = password => dispatch => {
  let wallet
  let keystores
  try {
    const wallet = web3js.eth.accounts.wallet.create(1);
    const keystores = web3js.eth.accounts.wallet.encrypt(password)
  } catch(error) {
    dispatch({
      type: 'CREATE_WALLET_ERROR',
      payload: { error }
    })
    return null
  }
  let addresses = [];
  for (let i=0; i<wallet.length; i++) {
    addresses.push(wallet[i].address)
  }
  dispatch({
    type: 'CREATE_WALLET',
    payload: { addresses, keystores }
  })
  return wallet
}

export const addAccount = (privateKey, password) => dispatch => {
  let account
  let keystores
  try {
    account = web3js.eth.accounts.wallet.add(privateKey)
    keystores = web3js.eth.accounts.wallet.encrypt(password)
  } catch (error) {
    dispatch({
      type: 'ADD_ACCOUNT_ERROR',
      payload: { error }
    })
    return null
  }
  dispatch({
    type: 'ADD_ACCOUNT',
    payload: { address: account.address, keystores }
  })
  return account
}

export const reviewTx = tx => ({
  type: 'REVIEW_TX',
  payload: {
    txObject: tx.tx,
  },
  meta: {
    title: tx.info.title,
    counterparties: tx.info.counterparties,
    values: tx.info.values,
  }
})

export const cancelTx = () => ({
  type: 'CANCEL_TX'
})

export const closeTx = () => ({
  type: 'CLOSE_TX'
})

export const openTx = () => ({
  type: 'OPEN_TX'
})

export const confirmTx = () => ({
  type: 'CONFIRM_TX'
})

export const sendTx = (txObject, counterparties) => dispatch => {
  return new Promise((resolve, reject) => {
    const walletLocked = web3js.eth.accounts.wallet.length === 0
    Promise.resolve(walletLocked && dispatch(unlockWalletRequest()))
    .then(() =>  web3js.eth.accounts.signTransaction(txObject, web3js.eth.accounts.wallet[0].privateKey))
    .then(signedTx => {
      return web3js.eth.sendSignedTransaction(signedTx.rawTransaction)
      .once('transactionHash', hash => {
        dispatch({
          type: 'SEND_TX_SUCCESS',
          payload: { txHash: hash }
        })
      })
      .once('error', error => {
        dispatch({
          type: 'SEND_TX_ERROR',
          payload: { txError: error }
        })
        dispatch(updateScheduledTxs())
        .then(() => reject(error))
      })
      .then(receipt => {
        console.log('txReceipt', receipt)
        if (receipt.status) counterparties.forEach(name => dispatch(addToken(name)))
        dispatch(updateScheduledTxs()).then(() => resolve(receipt))
      })
    })
    .catch(error => {
      dispatch({
        type: 'SEND_TX_ERROR',
        payload: { txError: error }
      })
      dispatch(updateScheduledTxs())
      .then(() => reject(error))
    })
  })
}

export const scheduleTx = (when, txObject) => (dispatch, getState) => {
  return (async function () {
    if (web3js.eth.accounts.wallet.length === 0) // If wallet locked
      await dispatch(unlockWalletRequest())

    let id
    let rawTransaction
    let txHash
    try {
      const signedTx = await web3js.eth.accounts.signTransaction(txObject, web3js.eth.accounts.wallet[0].privateKey)
      rawTransaction = signedTx.rawTransaction
      txHash = '0x' + new EthereumTx(rawTransaction).hash().toString('hex')
      id = "TX" + parseInt(txObject.nonce).toString().padStart(8, '0')
      browser.alarms.create(id, { when })
    } catch(error) {
      throw dispatch({
        type: 'SCHEDULE_TX_ERROR',
        payload: { txError: error }
      })
    }
    return dispatch({
      type: 'SCHEDULE_TX',
      payload: { id, txObject, rawTransaction, txHash, when }
    })
  })()
}

export const unscheduleTx = id => dispatch => {
  return new Promise((resolve, reject) => {
    browser.alarms.clear(id, cleared => {
      if (cleared) {
        dispatch({ type: 'UNSCHEDULE_TX', payload: { id }})
        resolve()
      } else {
        dispatch({ type: 'UNSCHEDULE_TX_ERROR' })
        reject()
      }
    })
  })
}

export const rescheduleSubscriptionsPayments = () => (dispatch, getState) => {
  return (async function () {
    console.log('rescheduling!')
    let { scheduledTXs, settings, subscriptions, wallet } = getState()
    const now = Date.now()
    // Delete unsent transactions
    let keys = Object.keys(scheduledTXs).filter(k => scheduledTXs[k].when > now).sort()
    for (let i=0; i<keys.length; i++) {
      await dispatch(unscheduleTx(keys[i]))
    }
    const hasValidHostname = sub => !sub.hostname.includes('#')
    const hostnames = subscriptions.filter(hasValidHostname).map(sub => sub.hostname)
    const amounts = subscriptions.filter(hasValidHostname).map(sub => sub.amount)
    if (hostnames.length === 0) return;
    const nonce = await web3js.eth.getTransactionCount(wallet.addresses[0], 'pending')
    let txObjects = []
    for (let i=0; i<6; i++) {
      txObjects.push(Object.assign(
        await createTxBuyThx(wallet.addresses[0], hostnames, amounts),
        { nonce: nonce + i }
      ))
    }
    // Schedule transactions
    const calcWhen = now => strings.paymentSchedule[settings.paymentSchedule](now).valueOf()
    let monthIndex = (new Date(now)).getMonth()
    let year = (new Date(now)).getFullYear()
    let when
    for (let i=0; i<txObjects.length; i++) {
      when = calcWhen((new Date(year, monthIndex)).valueOf())
      await dispatch(scheduleTx(when, txObjects[i]))
      monthIndex += 1
      if (monthIndex === 12) {
        year += 1
        monthIndex = 0
      }
    }
  })()
}

export const updateScheduledTxs = () => (dispatch, getState) => {
  console.log('updateScheduledTxs')
  return (async function() {
    let { scheduledTXs, wallet } = getState()
    const now = Date.now()
    const keys = Object.keys(scheduledTXs).filter(k => scheduledTXs[k].when > now).sort()
    if (keys.length === 0) return;
    const nonce = await web3js.eth.getTransactionCount(wallet.addresses[0], 'pending')
    // Check if nonces need to be updated
    let id = keys[0]
    if (parseInt(scheduledTXs[id].txObject.nonce) === nonce) return;
    // update nonces
    let txObjects = []
    let whens = []
    for (let i=0; i<keys.length; i++) {
      id = keys[i]
      txObjects.push(scheduledTXs[id].txObject)
      whens.push(scheduledTXs[id].when)
      await dispatch(unscheduleTx(id))
    }
    for (let i=0; i<txObjects.length; i++) {
      txObjects[i].nonce = nonce + i
      await dispatch(scheduleTx(whens[i], txObjects[i]))
    }
  })()
}

export const addToken = name => ({
  type: 'ADD_TOKEN',
  payload: { name }
})

export const removeToken = name => ({
  type: 'REMOVE_TOKEN',
  payload: { name }
})
