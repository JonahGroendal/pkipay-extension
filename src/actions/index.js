import web3js from '../api/web3js'
import browser from '../api/browser'
import strings from '../api/strings'
import { createTxBuyThx, depositAllCurrency } from '../api/blockchain'
import EthereumTx from 'ethereumjs-tx'

export const addSubscription = subscription => ({
  type: 'ADD_SUBSCRIPTION',
  subscription
});

export const removeSubscription = hostname => ({
  type: 'REMOVE_SUBSCRIPTION',
  hostname
});

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

export const setNextPayment = nextPayment => ({
  type: 'SET_NEXT_PAYMENT',
  nextPayment
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
  return resolveWalletUnlock(dispatch({ type: 'UNLOCK_WALLET_SUCCESS' }))
}

export const unlockWalletCancel = () => dispatch => {
  rejectWalletUnlock(dispatch({ type: 'UNLOCK_WALLET_CANCEL' }))
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
  return web3js.eth.sendTransaction(txObject)
  .once('transactionHash', hash => {
    dispatch({
      type: 'SEND_TX_SUCCESS',
      payload: { txHash: hash }
    })
    counterparties.forEach(name => dispatch(addToken(name)))
  })
  .once('error', error => dispatch({
    type: 'SEND_TX_ERROR',
    payload: { txError: error }
  }))
}

export const scheduleTx = (when, txObject) => (dispatch, getState) => {
  return (async function () {
    const { scheduledTXs } = getState()
    let id
    let rawTransaction
    let txHash
    const keys = Object.keys(scheduledTXs)
    .filter(tx => scheduledTXs[tx].when > Date.now())
    .sort((a, b) => parseInt(scheduledTXs[a].nonce) - parseInt(scheduledTXs[b].nonce))
    try {
      if (keys.length === 0)
        txObject.nonce = await web3js.eth.getTransactionCount(web3js.eth.accounts.wallet[0].address, 'pending')
      else
        txObject.nonce = parseInt(scheduledTXs[keys[keys.length-1]].txObject.nonce) + 1
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
      if (cleared)
        resolve(dispatch({ type: 'UNSCHEDULE_TX', payload: { id }}))
      else
        reject(dispatch({ type: 'UNSCHEDULE_TX_ERROR' }))
    })
  })
}

export const scheduleSubscriptionsPayment = when => (dispatch, getState) => {
  return new Promise((resolve, reject) => {
    const hostnames = []
    const amounts = []
    getState().subscriptions.forEach(sub => {
      if (!sub.hostname.includes('#')) {
        hostnames.push(sub.hostname)
        amounts.push(sub.amount)
      }
    })
    createTxBuyThx(web3js.eth.accounts.wallet[0].address, hostnames, amounts)
    .then(txObject => resolve(dispatch(scheduleTx(when, txObject))))
    .catch(reject)
  })
}

export const rescheduleSubscriptionsPayments = () => (dispatch, getState) => {
  return (async function () {
    let { scheduledTXs, settings } = getState()
    const now = Date.now()
    // Delete unsent transactions
    let keys = Object.keys(scheduledTXs)
    for (let i=0; i<keys.length; i++) {
      if (scheduledTXs[keys[i]].when > now)
        await dispatch(unscheduleTx(keys[i]))
    }
    // Schedule transactions
    let monthIndex = (new Date(now)).getMonth()
    let year = (new Date(now)).getFullYear()
    for (let i=0; i<12; i++) {
      const calcNextPaymentTime = strings.paymentSchedule[settings.paymentSchedule]
      if (i === 0)
        await dispatch(scheduleSubscriptionsPayment(Date.now() + 3000))
      else
        await dispatch(scheduleSubscriptionsPayment(calcNextPaymentTime((new Date(year, monthIndex)).valueOf()).valueOf()))
      monthIndex += 1
      if (monthIndex === 12) {
        year += 1
        monthIndex = 0
      }
    }
  })()
}

export const updateScheduledTxsNonces = () => (dispatch, getState) => {
  return (async function() {
    let nonce = await web3js.eth.getTransactionCount(web3js.eth.accounts.wallet[0].address, 'pending')
    let { scheduledTXs } = getState()
    const keys = Object.keys(scheduledTXs).sort()
    for (let i=0; i<keys.length; i++) {
      const id = keys[i]
      if (scheduledTXs[id].when > Date.now()) {
        await dispatch(unscheduleTx(id))
        scheduledTXs[id].txObject.nonce = nonce + i
        await dispatch(scheduleTx(scheduledTXs[id].when, scheduledTXs[id].txObject))
      }
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
