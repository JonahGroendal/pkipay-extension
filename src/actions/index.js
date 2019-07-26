import web3js from '../api/web3js'
import browser from '../api/browser'
import strings from '../api/strings'
import { createTxBuyThx } from '../api/blockchain'
import AcmeClient from '../api/AcmeClient'
import { encrypt, decrypt } from '../api/symmetricCrypto'

export const setObjectHostname = (hostname) => ({
  type: 'SET_OBJECT_HOSTNAME',
  hostname
})

export const setTabIndex = (index) => ({
  type: 'SET_TAB_INDEX',
  tabIndex: index
})

export const addSubscription = (subscription) => async (dispatch) => {
  if (web3js.eth.accounts.wallet.length === 0)
    await dispatch(unlockWalletRequest())
  dispatch({
    type: 'ADD_SUBSCRIPTION',
    subscription
  })
  // Remember token name
  dispatch(addToken(subscription.hostname))
  await dispatch(rescheduleSubscriptionsPayments()).catch(() => {})
}

export const removeSubscription = (hostname) => (dispatch) => {
  dispatch({
    type: 'REMOVE_SUBSCRIPTION',
    hostname
  })
  dispatch(rescheduleSubscriptionsPayments()).catch(() => {})
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
  const { keystore } = getState().wallet
  try {
    web3js.eth.accounts.wallet.decrypt(keystore, password)
  } catch (error) {
    return dispatch({ type: 'UNLOCK_WALLET_FAILURE' })
  }
  dispatch({ type: 'UNLOCK_WALLET_SUCCESS' })
  return resolveWalletUnlock(password)
}

export const unlockWalletCancel = () => (dispatch) => {
  dispatch({ type: 'UNLOCK_WALLET_CANCEL' })
  return rejectWalletUnlock(new Error('Wallet unlock canceled'))
}

export const createWallet = (password) => {
  console.log('createWallet')
  const wallet = web3js.eth.accounts.wallet.create(1);
  const keystore = web3js.eth.accounts.wallet.encrypt(password)
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
  const account = web3js.eth.accounts.wallet.add(privateKey)
  const keystore = web3js.eth.accounts.wallet.encrypt(password)
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

export const addToken = (tokenName) => ({
  type: 'ADD_TOKEN',
  payload: {
    token: tokenName
  }
})

export const removeToken = (tokenName) => ({
  type: 'REMOVE_TOKEN',
  payload: {
    token: tokenName
  }
})

export const reviewTx = (txObjects, counterparties, values) => ({
  type: 'REVIEW_TX',
  payload: {
    txObjects,
  },
  meta: {
    counterparties,
    values,
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

export const sendTx = (txObjects, counterparties) => async (dispatch) => {
  if (!Array.isArray(txObjects))
    txObjects = [txObjects]
  if (web3js.eth.accounts.wallet.length === 0)
    await dispatch(unlockWalletRequest())
  let receipts = [];
  let receipt;
  for (let i=0; i<txObjects.length-1; i++) {
    try {
      // we must await to ensure correct order
      receipt = await web3js.eth.sendTransaction(txObjects[i])
    } catch (txError) {
      dispatch({
        type: 'SEND_TX_ERROR',
        payload: { txError }
      })
      return null
    }
    receipts.push(receipt)
  }
  if (txObjects.length > 0) {
    let lastTx = web3js.eth.sendTransaction(txObjects[txObjects.length-1])
    .once('transactionHash', txHash => {
      dispatch({
        type: 'SEND_TX_SUCCESS',
        payload: { txHash }
      })
      counterparties.forEach(counterparty => dispatch(addToken(counterparty)))
    })
    .once('confirmation', numConfs => {
      dispatch(confirmTx())
      dispatch(updateScheduledTxs(parseInt(txObjects[txObjects.length-1].nonce)+1))
    })
    .catch(txError => {
      dispatch({
        type: 'SEND_TX_ERROR',
        payload: { txError }
      })
    })
    receipts.push(lastTx)
  }
  return Promise.all(receipts)
}

export const scheduleTx = (when, txObject, counterparties) => async (dispatch) => {
  if (web3js.eth.accounts.wallet.length === 0)
    await dispatch(unlockWalletRequest())
  const pk = web3js.eth.accounts.wallet[txObject.from].privateKey
  let id; let signedTx;
  try {
    signedTx = await web3js.eth.accounts.signTransaction(txObject, pk)
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
    payload: {
      id, txObject, when,
      rawTransaction: signedTx.rawTransaction,
      txHash: signedTx.transactionHash
    }
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

export const updateScheduledTxs = (nonce=-1) => async (dispatch, getState) => {
  console.log('updateScheduledTxs')
  let { scheduledTXs, wallet } = getState()
  const now = Date.now()
  const keys = Object.keys(scheduledTXs).filter(k => scheduledTXs[k].when > now).sort()
  if (keys.length === 0) return;
  if (nonce === -1)
    nonce = await web3js.eth.getTransactionCount(wallet.addresses[wallet.defaultAccount], 'pending')
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

export const requestDnsChallenge = (password, domainName) => async (dispatch) => {
  console.log('requestDnsChallenge')
  const authority = (process.env.REACT_APP_ACTUAL_ENV === 'development' || process.env.REACT_APP_ACTUAL_ENV === 'test')
    ? 'letsencrypt-staging'
    : 'letsencrypt'
  const ac = await AcmeClient(authority);
  const jwkCiphertextObj = await encrypt(JSON.stringify(ac.exportJwk()), password);
  let recordName; let recordText; let order;
  try {
    ({ recordName, recordText, order } = await ac.requestDnsChallenge(domainName));
  } catch (error) {
    dispatch({
      type: 'REQUEST_DNS_CHALLENGE_ERROR',
      payload: error.message
    })
    throw error;
  }
  dispatch({
    type: 'REQUEST_DNS_CHALLENGE',
    payload: {
      domainName,
      recordName,
      recordText,
      order,
      jwk: jwkCiphertextObj
    }
  })
}

export const cancelDnsChallenge = () => ({
  type: 'CANCEL_DNS_CHALLENGE'
})

export const submitDnsChallenge = (password) => async (dispatch, getState) => {
  console.log('submitDnsChallenge')
  const state = getState().dnsChallenge
  const order = state.order
  const jwk = JSON.parse(await decrypt(state.jwk, password))
  const authority = (process.env.REACT_APP_ACTUAL_ENV === 'development' || process.env.REACT_APP_ACTUAL_ENV === 'test')
    ? 'letsencrypt-staging'
    : 'letsencrypt'
  const ac = await AcmeClient(authority, jwk)
  let certUrl; let pkcs8Key;
  try {
    ({ certUrl, pkcs8Key } = await ac.submitDnsChallengeAndFinalize(order));
  } catch (error) {
    dispatch({
      type: 'DNS_CHALLENGE_ERROR',
      payload: error.message
    })
    throw error;
  }
  dispatch({
    type: 'DNS_CHALLENGE_SUCCESS',
    payload: {
      certUrl,
      pkcs8Key: await encrypt(pkcs8Key, password)
    }
  })
  return { certUrl, pkcs8Key }
}

export const resetDnsChallenge = () => ({
  type: 'RESET_DNS_CHALLENGE'
})

export const completeDnsChallenge = () =>({
  type: 'COMPLETE_DNS_CHALLENGE'
})
