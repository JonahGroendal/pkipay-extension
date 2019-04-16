import web3js from '../api/web3js'
import browser from '../api/browser'
import strings from '../api/strings'
import { createTxBuyThx, approveTokenBuyer } from '../api/blockchain'
import EthereumTx from 'ethereumjs-tx'

export const setObjectHostname = (hostname) => ({
  type: 'SET_OBJECT_HOSTNAME',
  hostname
})

export const setTabIndex = (index) => ({
  type: 'SET_TAB_INDEX',
  tabIndex: index
})

export const addSubscription = (subscription) => (dispatch) => {
  dispatch({
    type: 'ADD_SUBSCRIPTION',
    subscription
  })
  return dispatch(rescheduleSubscriptionsPayments()).catch(() => {})
}

export const removeSubscription = (hostname) => (dispatch) => {
  dispatch({
    type: 'REMOVE_SUBSCRIPTION',
    hostname
  })
  return dispatch(rescheduleSubscriptionsPayments()).catch(() => {})
}

export const setCurrency = (currency) => ({
  type: 'SET_CURRENCY',
  currency
});

export const setPaymentSchedule = (paymentSchedule) => ({
  type: 'SET_PAYMENT_SCHEDULE',
  paymentSchedule
});

export const setThemeType = (themeType) => ({
  type: 'SET_THEME_TYPE',
  themeType
});

let resolveWalletUnlock;
let rejectWalletUnlock;

export const unlockWalletRequest = () => (dispatch) => {
  console.log('unlockWalletRequest')
  dispatch({ type: 'UNLOCK_WALLET_REQUEST' })

  return new Promise((resolve, reject) => {
    resolveWalletUnlock = resolve;
    rejectWalletUnlock = reject;
  })
}

export const unlockWallet = (password) => (dispatch, getState) => {
  console.log('unlockWallet')
  const { addresses, keystore, defaultAccount } = getState().wallet
  try {
    web3js.eth.accounts.wallet.decrypt(keystore, password)
  } catch (error) {
    return dispatch({ type: 'UNLOCK_WALLET_FAILURE' })
  }
  dispatch({ type: 'UNLOCK_WALLET_SUCCESS' })
  approveTokenBuyer(addresses[defaultAccount])
  return resolveWalletUnlock()
}

export const unlockWalletCancel = () => (dispatch) => {
  dispatch({ type: 'UNLOCK_WALLET_CANCEL' })
  return rejectWalletUnlock()
}

export const createWallet = (password) => {
  console.log('createWallet')
  let wallet
  let keystore
  try {
    wallet = web3js.eth.accounts.wallet.create(1);
    keystore = web3js.eth.accounts.wallet.encrypt(password)
  } catch(error) {
    return {
      type: 'CREATE_WALLET_ERROR',
      payload: { error }
    }
  }
  // Download copy of keystore for safe keeping
  let file = new File([JSON.stringify(keystore[0])], 'keystore.json', {type: 'text/plain'})
  browser.downloads.download({url: URL.createObjectURL(file), filename: 'keystore.json'})

  let addresses = [];
  for (let i=0; i<wallet.length; i++) {
    addresses.push(wallet[i].address)
  }
  return {
    type: 'CREATE_WALLET',
    payload: { addresses, keystore }
  }
}

export const deleteWallet = () => ({
  type: 'DELETE_WALLET'
})

export const addAccount = (privateKey, password) => {
  console.log('addAccount')
  let account; let keystore
  try {
    account = web3js.eth.accounts.wallet.add(privateKey)
    keystore = web3js.eth.accounts.wallet.encrypt(password)
  } catch (error) {
    return {
      type: 'ADD_ACCOUNT_ERROR',
      payload: { error }
    }
  }
  approveTokenBuyer(account.address)
  return {
    type: 'ADD_ACCOUNT',
    payload: { address: account.address, keystore }
  }
}

export const setDefaultAccount = (accountIndex) => ({
  type: 'SET_DEFAULT_ACCOUNT',
  payload: {
    defaultAccount: accountIndex
  }
})

export const reviewTx = (tx) => ({
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

export const sendTx = (txObject) => async (dispatch) => {
  if (web3js.eth.accounts.wallet.length === 0)
    await dispatch(unlockWalletRequest())
  const pk = web3js.eth.accounts.wallet[txObject.from].privateKey
  const signedTx = await web3js.eth.accounts.signTransaction(txObject, pk)
  await web3js.eth.sendSignedTransaction(signedTx.rawTransaction)
  .once('transactionHash', txHash => {
    dispatch({
      type: 'SEND_TX_SUCCESS',
      payload: { txHash }
    })
  })
  .catch(txError => {
    dispatch({
      type: 'SEND_TX_ERROR',
      payload: { txError }
    })
  })
  await dispatch(updateScheduledTxs())
}

export const scheduleTx = (when, txObject) => async (dispatch, getState) => {
  if (web3js.eth.accounts.wallet.length === 0)
    await dispatch(unlockWalletRequest())
  let id
  let rawTransaction
  let txHash
  try {
    const pk = web3js.eth.accounts.wallet[txObject.from].privateKey
    const signedTx = await web3js.eth.accounts.signTransaction(txObject, pk)
    rawTransaction = signedTx.rawTransaction
    txHash = '0x' + new EthereumTx(rawTransaction).hash().toString('hex')
    id = "TX" + parseInt(txObject.nonce).toString().padStart(8, '0')
    browser.alarms.create(id, { when })
  } catch(error) {
    dispatch({
      type: 'SCHEDULE_TX_ERROR',
      payload: { txError: error }
    })
    throw error;
  }
  dispatch({
    type: 'SCHEDULE_TX',
    payload: { id, txObject, rawTransaction, txHash, when }
  })
}

export const unscheduleTx = (id) => (dispatch) => {
  console.log('unscheduleTx')
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

export const rescheduleSubscriptionsPayments = () => async (dispatch, getState) => {
  console.log('rescheduleSubscriptionsPayments')
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
  // Schedule transactions
  const nonce = await web3js.eth.getTransactionCount(wallet.addresses[wallet.defaultAccount], 'pending')
  const txObject = await createTxBuyThx(wallet.addresses[wallet.defaultAccount], hostnames, amounts)
  const calcWhen = now => strings.paymentSchedule[settings.paymentSchedule](now).valueOf()
  let monthIndex = (new Date(now)).getMonth()
  let year = (new Date(now)).getFullYear()
  let when
  for (let i=0; i<6; i++) {
    when = calcWhen((new Date(year, monthIndex)).valueOf())
    await dispatch(scheduleTx(when, { ...txObject, nonce: nonce + i }))
    monthIndex += 1
    if (monthIndex === 12) {
      year += 1
      monthIndex = 0
    }
  }
}

export const updateScheduledTxs = () => async (dispatch, getState) => {
  console.log('updateScheduledTxs')
  let { scheduledTXs, wallet } = getState()
  const now = Date.now()
  const keys = Object.keys(scheduledTXs).filter(k => scheduledTXs[k].when > now).sort()
  if (keys.length === 0) return;
  const nonce = await web3js.eth.getTransactionCount(wallet.addresses[wallet.defaultAccount], 'pending')
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
}
