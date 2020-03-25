/* global BigInt */

import web3js from './web3js'
import namehash from 'eth-ens-namehash'
import TokenSale from 'pkipay-blockchain/build/contracts/TokenSale.json'
import TokenResolver from 'pkipay-blockchain/build/contracts/TokenResolver.json'
import DNSRegistrar from 'dns-over-ens/build/contracts/DNSRegistrar.json'
import API from 'pkipay-blockchain/build/contracts/API.json'
import ENSDonationEscrow from 'pkipay-blockchain/build/contracts/ENSDonationEscrow.json'
import OwnedByENSNode from 'pkipay-blockchain/build/contracts/OwnedByENSNode.json'
import ERC20 from 'pkipay-blockchain/build/contracts/ERC20.json'
import ERC20DetailedString from 'pkipay-blockchain/build/contracts/ERC20DetailedString.json'
import ERC20DetailedBytes32 from 'pkipay-blockchain/build/contracts/ERC20DetailedBytes32.json'
import ERC20Mock from 'pkipay-blockchain/build/contracts/ERC20Mock.json'
import X509ForestOfTrust from 'x509-forest-of-trust/build/contracts/X509ForestOfTrust.json'
import ENSRegistry from '@ensdomains/ens/build/contracts/ENSRegistry.json'
import IExchangeRates from 'pkipay-blockchain/build/contracts/IExchangeRates.json'
import IMedianizer from 'pkipay-blockchain/build/contracts/IMedianizer.json'

const contractAddrs = {
  dai: {
    1: '0x6b175474e89094c44da98b954eedeac495271d0f',
    42: '0x4f96fe3b7a6cf9725f59d353f723c1bdb64ca6aa'
  },
  medianizer: {
    1: '0x64DE91F5A373Cd4c28de3600cB34C7C6cE410C85',
    42: '0x0E30F0FC91FDbc4594b1e2E5d64E6F1f94cAB23D'
  }
}

export const chainId = process.env.REACT_APP_ACTUAL_ENV === 'production'
  ? 1
  : 42

const resolver = new web3js.eth.Contract(TokenResolver.abi, TokenResolver.networks[chainId].address);
const registrar = new web3js.eth.Contract(DNSRegistrar.abi, DNSRegistrar.networks[chainId].address);
const api = new web3js.eth.Contract(API.abi, API.networks[chainId].address);
const escrow = new web3js.eth.Contract(ENSDonationEscrow.abi, ENSDonationEscrow.networks[chainId].address);
const ens = new web3js.eth.Contract(ENSRegistry.abi, ENSRegistry.networks[chainId].address);
const dai = new web3js.eth.Contract(ERC20.abi, contractAddrs.dai[chainId]);
const medianizer = new web3js.eth.Contract(IMedianizer.abi, contractAddrs.medianizer[chainId])

const dnsRootEnsAddress = process.env.REACT_APP_ACTUAL_ENV === 'production'
  ? 'dnsroot.eth'
  : 'dnsroot.test'

export const addresses = {
  'ETH': '0x0000000000000000000000000000000000000000',
  'DAI': dai.options.address
}

export async function apiContractApproved(from, tokenAddr) {
  if (process.env.REACT_APP_ACTUAL_ENV !== 'production')
    console.log('apiContractApproved')
  if (!tokenAddr) tokenAddr = addresses.DAI
  const allowance = await dai.methods.allowance(from, tokenAddr).call()
  return parseInt(allowance.toString()) > 10**36
}

export function createTxApproveApiContract(from, tokenAddr) {
  if (process.env.REACT_APP_ACTUAL_ENV !== 'production')
    console.log('createTxApproveApiContract')
  if (!tokenAddr) tokenAddr = addresses.DAI
  const maxUint = "115792089237316195423570985008687907853269984665640564039457584007913129639935"
  const token = new web3js.eth.Contract(ERC20.abi, tokenAddr)
  return {
    to: tokenAddr,
    from,
    gas: 50000,
    data: token.methods.approve(api.options.address, maxUint).encodeABI()
  }
}

export function createTxDonate(from, tokenAddr, ensNames, amounts) {
  if (process.env.REACT_APP_ACTUAL_ENV !== 'production')
    console.log('createTxDonate')
  if (!Array.isArray(ensNames)) ensNames = [ensNames];
  if (!Array.isArray(amounts)) amounts = [amounts];
  if (amounts.length !== ensNames.length)
    throw new Error("Parallel arrays have unequal lengths")
  const ensNodes = ensNames.map(namehash.hash)
  const values = amounts.map(amount => web3js.utils.toWei(amount.toString()))

  return {
    from,
    to: api.options.address,
    gas: 150000 + (32000 * ensNodes.length),  // Exact calculation: 97731 + (30282 * length)
    data: api.methods.multiDonate(dai.options.address, ensNodes, values).encodeABI() // escrow.methods.donate(tokenAddr, ensNode, value).encodeABI()
  }
}

export function createTxDonateETH(from, ensNames, amounts) {
  if (process.env.REACT_APP_ACTUAL_ENV !== 'production')
    console.log('createTxDonateETH')
  if (!Array.isArray(ensNames)) ensNames = [ensNames];
  if (!Array.isArray(amounts)) amounts = [amounts];
  if (amounts.length !== ensNames.length)
    throw new Error("Parallel arrays have unequal lengths")
  const ensNodes = ensNames.map(namehash.hash)
  const values = amounts.map(amount => web3js.utils.toWei(amount.toString()))
  const totalValue = web3js.utils.toWei(amounts.reduce((a, b) => a + b).toString())

  return {
    from,
    to: api.options.address,
    gas: 60000 + (42000 * ensNames.length), // Exact calculation: 22655 + (40795 * length)
    value: totalValue,
    data: api.methods.multiDonateETH(ensNodes, values).encodeABI()
  }
}

export function createTxBuyTokens(from, ensNames, amounts) {
  if (process.env.REACT_APP_ACTUAL_ENV !== 'production')
    console.log('createTxBuyTokens');
  if (!Array.isArray(ensNames)) ensNames = [ensNames];
  if (!Array.isArray(amounts)) amounts = [amounts];
  if (amounts.length !== ensNames.length)
    throw new Error("Parallel arrays have unequal lengths")
  const ensNodes = ensNames.map(namehash.hash)
  const weiValues = amounts.map(a => web3js.utils.toWei(a.toString()));
  return {
    from,
    to: api.options.address,
    gas: (300000 + (300000 * weiValues.length)).toString(),
    data: api.methods.multiBuy(dai.options.address, ensNodes, weiValues).encodeABI()
  }
}

export async function createTxSellToken(from, tokenAddr, tokenSaleAddr, amount) {
  if (process.env.REACT_APP_ACTUAL_ENV !== 'production')
    console.log('createTxSellToken')
  const txs = []
  const weiValue = web3js.utils.toWei(amount.toString())
  const token = new web3js.eth.Contract(ERC20.abi, tokenAddr)
  const tokenSale = new web3js.eth.Contract(TokenSale.abi, tokenSaleAddr)
  const allowance = await token.methods.allowance(from, tokenSaleAddr).call()
  if (BigInt(allowance) < BigInt(weiValue))
    txs.push({
      from,
      to: tokenAddr,
      gas: "100000",
      data: token.methods.approve(tokenSaleAddr, weiValue).encodeABI()
    })
  txs.push({
    from,
    to: tokenSaleAddr,
    gas: "100000",
    data: tokenSale.methods.sell(dai.options.address, from, weiValue).encodeABI()
  })
  return txs
}

export async function createTxWithdraw(from, tokenAddr, tokenSaleEnsName, amount) {
  if (process.env.REACT_APP_ACTUAL_ENV !== 'production')
    console.log('createTxWithdrawDAI')
  const weiAmount = web3js.utils.toWei(amount.toString())
  const ensNode = namehash.hash(tokenSaleEnsName)
  const saleAddr = await resolver.methods.tokenSale(ensNode).call()
  if (saleAddr === '0x0000000000000000000000000000000000000000')
    throw new Error('Token sale does not exist');
  let tokenSale = new web3js.eth.Contract(TokenSale.abi, saleAddr);
  return {
    from,
    to: saleAddr,
    gas: 100000,
    data: await tokenSale.methods.withdraw(tokenAddr, from, weiAmount).encodeABI()
  }
}

export async function createTxWithdrawETH(from, tokenSaleEnsName, amount) {
  if (process.env.REACT_APP_ACTUAL_ENV !== 'production')
    console.log('createTxWithdrawETH')
  const weiAmount = web3js.utils.toWei(amount.toString())
  const ensNode = namehash.hash(tokenSaleEnsName)
  const saleAddr = await resolver.methods.tokenSale(ensNode).call()
  if (saleAddr === '0x0000000000000000000000000000000000000000')
    throw new Error('Token sale does not exist');
  let tokenSale = new web3js.eth.Contract(TokenSale.abi, saleAddr);
  return {
    from,
    to: saleAddr,
    gas: 100000,
    data: await tokenSale.methods.withdrawETH(from, weiAmount).encodeABI()
  }
}

export function createTxReclaimDonations(from, ensNode, tokenAddr) {
  if (process.env.REACT_APP_ACTUAL_ENV !== 'production')
    console.log('createTxReclaimDonations')
  return {
    from,
    to: escrow.options.address,
    gas: 80000,
    data: escrow.methods.reclaim(tokenAddr, ensNode).encodeABI()
  }
}

export function createTxReclaimDonationsETH(from, ensNode) {
  if (process.env.REACT_APP_ACTUAL_ENV !== 'production')
    console.log('createTxReclaimDonationsETH')
  return {
    from,
    to: escrow.options.address,
    gas: 50000,
    data: escrow.methods.reclaimETH(ensNode).encodeABI()
  }
}

export function createTxWithdrawDonations(from, tokenAddr, ensName, donors) {
  if (process.env.REACT_APP_ACTUAL_ENV !== 'production')
    console.log('createTxWithdrawDonations')
  const ensNode = namehash.hash(ensName)
  return {
    from,
    to: escrow.options.address,
    gas: 100000, // gas needed decreases as number of donors increases due to gas refunds
    data: escrow.methods.withdraw(tokenAddr, ensNode, donors, from).encodeABI()
  }
}

export function createTxWithdrawDonationsETH(from, ensName, donors) {
  if (process.env.REACT_APP_ACTUAL_ENV !== 'production')
    console.log('createTxWithdrawDonationsETH')
  const ensNode = namehash.hash(ensName)
  return {
    from,
    to: escrow.options.address,
    gas: 100000, // gas needed decreases as number of donors increases due to gas refunds
    data: escrow.methods.withdrawETH(ensNode, donors, from).encodeABI()
  }
}

export async function createTxTransfer(from, toEnsName, tokenAddr, amount) {
  if (process.env.REACT_APP_ACTUAL_ENV !== 'production')
    console.log('createTxTransferTokens')
  const weiAmount = web3js.utils.toWei(amount.toString())
  const to = await resolveAddress(toEnsName)
  if (to === '0x0000000000000000000000000000000000000000')
    throw new Error('"'.concat(toEnsName, '" resolves to the zero address'))
  const token = new web3js.eth.Contract(ERC20.abi, tokenAddr)
  return {
    from,
    to: tokenAddr,
    gas: 70000,
    data: token.methods.transfer(to, weiAmount).encodeABI()
  }
}

export async function createTxTransferETH(from, toEnsName, amount) {
  if (process.env.REACT_APP_ACTUAL_ENV !== 'production')
    console.log('createTxTransferETH')
  const weiAmount = web3js.utils.toWei(amount.toString())
  const to = await resolveAddress(toEnsName)
  if (to === '0x0000000000000000000000000000000000000000')
    throw new Error('"'.concat(toEnsName, '" resolves to the zero address'))
  return {
    from,
    to,
    value: weiAmount,
    gas: 24000
  }
}

// Because the Medianizer contract has been changed to restrict who can call
// read() to a whitelist of addresses, getStorageAt needs to be used to get
// around the restriction
export async function getPriceOfETHInUSD() {
  if (process.env.REACT_APP_ACTUAL_ENV !== 'production')
    console.log('getPriceOfETHInUSD')
  // Get the value `val` from the contract's private storage
  const hexValueOfVal = '0x'.concat((await web3js.eth.getStorageAt(contractAddrs.medianizer[chainId], 1)).slice(-32))
  return parseInt(web3js.utils.fromWei(hexValueOfVal))
}

export function domainNameToEnsName(domainName) {
  return domainName.concat('.', dnsRootEnsAddress)
}

export async function resolveAddress(ensName) {
  if (process.env.REACT_APP_ACTUAL_ENV !== 'production')
    console.log('resolveAddress')
  let resolvedAddr = '0x0000000000000000000000000000000000000000'
  const ensNode = namehash.hash(ensName)
  const ensResolverAddr = await ens.methods.resolver(ensNode).call()
  if (ensResolverAddr !== '0x0000000000000000000000000000000000000000') {
    const ensResolver = new web3js.eth.Contract(TokenResolver.abi, ensResolverAddr)
    resolvedAddr = await ensResolver.methods.addr(ensNode).call()
  }
  return resolvedAddr
}

/**
 * @param {string} ensName - The ENS address of the token
 * @returns {string|undefined} - The address of the token that ensName resolves to, or undefined if there's no resolver
 */
export async function resolveToken(ensName, options={ usePublicResolver: false }) {
  if (process.env.REACT_APP_ACTUAL_ENV !== 'production')
    console.log('resolveToken')
  let address
  const ensNode = namehash.hash(ensName)
  if (options.usePublicResolver) {
    address = await resolver.methods.token(ensNode).call()
  } else {
    const ensResolverAddr = await ens.methods.resolver(ensNode).call()
    if (ensResolverAddr !== '0x0000000000000000000000000000000000000000') {
      const ensResolver = new web3js.eth.Contract(TokenResolver.abi, ensResolverAddr)
      address = await ensResolver.methods.token(ensNode).call()
    }
  }
  return address
}

/**
 * @param {string} ensName - The ENS address of the token
 * @returns {string|undefined} - The address of the token sale that ensName resolves to, or undefined if there's no resolver
 */
export async function resolveTokenSale(ensName, options={ usePublicResolver: false }) {
  if (process.env.REACT_APP_ACTUAL_ENV !== 'production')
    console.log('resolveTokenSale')
  let address
  const ensNode = namehash.hash(ensName)
  if (options.usePublicResolver) {
    address = await resolver.methods.tokenSale(ensNode).call()
  } else {
    const ensResolverAddr = await ens.methods.resolver(ensNode).call()
    if (ensResolverAddr !== '0x0000000000000000000000000000000000000000') {
      const ensResolver = new web3js.eth.Contract(TokenResolver.abi, ensResolverAddr)
      address = await ensResolver.methods.tokenSale(ensNode).call()
    }
  }
  return address
}

export async function getTokenOwner(tokenAddr) {
  if (process.env.REACT_APP_ACTUAL_ENV !== 'production')
    console.log('getTokenOwner')
  const ownedContract = new web3js.eth.Contract(OwnedByENSNode.abi, tokenAddr);
  return await ownedContract.methods.owner().call();
}

export async function getEnsNodeOwner(ensName) {
  if (process.env.REACT_APP_ACTUAL_ENV !== 'production')
    console.log('getEnsNodeOwner')
  const ensNode = namehash.hash(ensName)
  return await ens.methods.owner(ensNode).call();
}

export async function getPendingDonations(from) {
  if (process.env.REACT_APP_ACTUAL_ENV !== 'production')
    console.log('getPendingDonations')
  const donations = await escrow.getPastEvents('Donation', {
    filter: { donor: from },
    fromBlock: 0
  })

  const uniqueTokenDoneePairs = donations
    .map(e => JSON.stringify([e.returnValues.token, e.returnValues.donee]))
    .filter((value, index, array) => (array.indexOf(value) === index))
    .map(utdp => JSON.parse(utdp))

  const pendingDonations = []
  for (let i=0; i<uniqueTokenDoneePairs.length; i++) {
    const [token, donee] = uniqueTokenDoneePairs[i]
    const balance = parseFloat(web3js.utils.fromWei(await escrow.methods.balances(token, donee, from).call()))
    if (balance > 0)
      pendingDonations.push({ token, donee, balance })
  }

  return pendingDonations
}

export async function getPendingWithdrawals(ensName) {
  if (process.env.REACT_APP_ACTUAL_ENV !== 'production')
    console.log('getPendingWithdrawals')
  const donee = namehash.hash(ensName)
  const donations = await escrow.getPastEvents('Donation', {
    filter: { donee },
    fromBlock: 0
  })
  const uniqueTokenDonorPairs = donations
    .map(e => JSON.stringify([e.returnValues.token, e.returnValues.donor]))
    .filter((value, index, array) => (array.indexOf(value) === index))
    .map(utdp => JSON.parse(utdp))

  const pendingWithdrawals = {}
  for (let i=0; i<uniqueTokenDonorPairs.length; i++) {
    const [token, donor] = uniqueTokenDonorPairs[i]
    const balance = parseFloat(web3js.utils.fromWei(await escrow.methods.balances(token, donee, donor).call()))
    if (balance > 0) {
      if(!pendingWithdrawals[token])
        pendingWithdrawals[token] = []
      pendingWithdrawals[token].push({ donor, balance })
    }
  }

  return pendingWithdrawals
}

export async function getTokenSymbol(tokenAddr) {
  if (process.env.REACT_APP_ACTUAL_ENV !== 'production')
    console.log('getTokenSymbol')
  const entries = Object.entries(addresses)
  const index = entries.map(([key, value]) => value).indexOf(tokenAddr)
  if (index !== -1)
    return entries[index][0]
  try {
    const token = new web3js.eth.Contract(ERC20DetailedString.abi, tokenAddr)
    return await token.methods.symbol().call()
  } catch {}
  try {
    const token = new web3js.eth.Contract(ERC20DetailedBytes32.abi, tokenAddr)
    return web3js.utils.hexToUtf8(await token.methods.symbol().call())
  } catch {}
}

export async function getTokenName(tokenAddr) {
  if (process.env.REACT_APP_ACTUAL_ENV !== 'production')
    console.log('getTokenName')
  const entries = Object.entries(addresses)
  const index = entries.map(([key, value]) => value).indexOf(tokenAddr)
  if (index !== -1)
    return entries[index][0]
  try {
    const token = new web3js.eth.Contract(ERC20DetailedString.abi, tokenAddr)
    return await token.methods.name().call()
  } catch {}
  try {
    const token = new web3js.eth.Contract(ERC20DetailedBytes32.abi, tokenAddr)
    return web3js.utils.hexToUtf8(await token.methods.name().call())
  } catch {}
}

export async function getTokenBalance(from, tokenAddr) {
  const token = new web3js.eth.Contract(ERC20.abi, tokenAddr)
  const weiBalance = await token.methods.balanceOf(from).call()
  return parseFloat(web3js.utils.fromWei(weiBalance.toString()))
}

export async function registerAsDomainOwner(from, domainName) {
  if (process.env.REACT_APP_ACTUAL_ENV !== 'production')
    console.log('registerAsDomainOwner')
  if (domainName.split('.').length !== 2)
    throw new Error("Invalid domain name: '"+domainName+"' is not of the form domain.tld")
  const ensNode = namehash.hash(domainNameToEnsName(domainName))
  const currentOwner = await ens.methods.owner(ensNode).call();
  if (currentOwner !== from) {
    const labelHashes = domainName.split('.').reverse().map(web3js.utils.sha3)
    // register(bytes32 tld, bytes32 domain, address owner)
    const tx = registrar.methods.register(labelHashes[0], labelHashes[1], from)
    const options = { from, gas: 1000000 }
    // first make sure it works
    await tx.call(options)
    await tx.send(options)
  }
}

export async function pointEnsNodeToResolver(from, ensName) {
  if (process.env.REACT_APP_ACTUAL_ENV !== 'production')
    console.log('pointEnsNodeToResolver')
  const ensNode = namehash.hash(ensName) // domain.tld.dnsroot.eth
  const currentResolver = await ens.methods.resolver(ensNode).call();
  if (currentResolver !== resolver.options.address) {
    // setResolver(bytes32 node, address resolver)
    await ens.methods.setResolver(ensNode, resolver.options.address).send({ from, gas: 100000 })
  }
}

export async function pointResolverAddrToTokenSale(from, ensName) {
  if (process.env.REACT_APP_ACTUAL_ENV !== 'production')
    console.log('pointResolverAddrToTokenSale')
  const ensNode = namehash.hash(ensName)
  let tokenSaleAddr = await resolver.methods.tokenSale(ensNode).call()
  if (tokenSaleAddr === '0x0000000000000000000000000000000000000000') {
    await resolver.methods.createTokenAndSale(ensNode).send({ from, gas: 400000 })
    tokenSaleAddr = await resolver.methods.tokenSale(ensNode).call()
  }
  await resolver.methods.setAddr(ensNode, tokenSaleAddr).send({ from, gas: 100000 })
}

export async function pointResolverAddrToSelf(from, ensName) {
  if (process.env.REACT_APP_ACTUAL_ENV !== 'production')
    console.log('pointResolverAddrToSelf')
  const ensNode = namehash.hash(ensName)
  await resolver.methods.setAddr(ensNode, from).send({ from, gas: 100000 })
}

export async function getTokenSaleInfo(ensName) {
  if (process.env.REACT_APP_ACTUAL_ENV !== 'production')
    console.log('getTokenSaleInfo')
  let buyPrice = 1
  let sellPrice = 1
  let reservesDAI = 0
  let reservesETH = 0
  const node = namehash.hash(ensName)
  const tokenSaleAddr = await resolver.methods.tokenSale(node).call()
  if (tokenSaleAddr !== '0x0000000000000000000000000000000000000000') {
    const tokenSale = new web3js.eth.Contract(TokenSale.abi, tokenSaleAddr)
    const ratesAddr = await tokenSale.methods.rates().call()
    const rates = new web3js.eth.Contract(IExchangeRates.abi, ratesAddr)
    reservesDAI = parseFloat(web3js.utils.fromWei(await dai.methods.balanceOf(tokenSaleAddr).call()))
    reservesETH = parseFloat(web3js.utils.fromWei((await web3js.eth.getBalance(tokenSaleAddr)).toString()))
    buyPrice = parseFloat(web3js.utils.fromWei(await rates.methods.buy(dai.options.address).call()))
    sellPrice = parseFloat(web3js.utils.fromWei(await rates.methods.sell(dai.options.address).call()))
  }
  return { buyPrice, sellPrice, reservesDAI, reservesETH }
}

export async function getTokenInfo(ensName) {
  if (process.env.REACT_APP_ACTUAL_ENV !== 'production')
    console.log('getTokenInfo')
  let totalSupply = 0
  const ensNode = namehash.hash(ensName)
  const address = await resolver.methods.token(ensNode).call()
  if (address !== '0x0000000000000000000000000000000000000000') {
    const token = new web3js.eth.Contract(ERC20.abi, address)
    totalSupply = parseFloat(web3js.utils.fromWei(await token.methods.totalSupply().call()))
  }
  return { totalSupply }
}

export async function getBalanceETH(from) {
  if (process.env.REACT_APP_ACTUAL_ENV !== 'production')
    console.log('getBalanceETH')
  const weiBalance = await web3js.eth.getBalance(from)
  return parseFloat(web3js.utils.fromWei(weiBalance.toString()))
}

export async function getBalanceDAI(from) {
  if (process.env.REACT_APP_ACTUAL_ENV !== 'production')
    console.log('getBalanceDAI')
  const weiBalance = await dai.methods.balanceOf(from).call()
  return parseFloat(web3js.utils.fromWei(weiBalance.toString()))
}

export async function getBalanceERC20(from, tokenAddr) {
  if (process.env.REACT_APP_ACTUAL_ENV !== 'production')
    console.log('getBalanceERC20')
  const token = new web3js.eth.Contract(ERC20.abi, tokenAddr)
  const weiBalance = await token.methods.balanceOf(from).call()
  return parseFloat(web3js.utils.fromWei(weiBalance.toString()))
}

export async function subscribeToDaiTransfer(from, onTransfer) {
  if (process.env.REACT_APP_ACTUAL_ENV !== 'production')
    console.log('subscribeToDaiTransfer')
  const currentBlock = await web3js.eth.getBlockNumber();
  const subscription = dai.events.Transfer({
    filter: [{to: from}, {from: from}],
    fromBlock: currentBlock,
  }).on('data', function(event) {
    getBalanceDAI(from).then(onTransfer)
  })
  return subscription.unsubscribe;
}

export async function getTotalContributions(ensName, fromBlock = 0) {
  if (process.env.REACT_APP_ACTUAL_ENV !== 'production')
    console.log('getTotalContributions')
  const ensNode = namehash.hash(ensName);

  const donationEvents = await api.getPastEvents('Donation', {
    filter: { node: ensNode },
    fromBlock: 0
  })
  const buyEvents = await api.getPastEvents('Donation', {
    filter: { node: ensNode },
    fromBlock: 0
  })

  const eventsAll = [...donationEvents, ...buyEvents].sort((a, b) => a.blockNumber - b.blockNumber)

  const oneMonthAgoBlockNum = await timestampToBlockNum(Date.now() - 60*60*24*30 * 1000)
  const eventsLastMonth = eventsAll.filter(e => e.blockNumber >= oneMonthAgoBlockNum)

  const getTotals = events => {
    const byToken = {}
    events.forEach(event => {
      if (!byToken[event.returnValues.currency])
        byToken[event.returnValues.currency] = 0
      byToken[event.returnValues.currency] += parseFloat(web3js.utils.fromWei(event.returnValues.value))
    })
    return byToken
  }

  return {
    all: getTotals(eventsAll),
    lastMonth: getTotals(eventsLastMonth)
  }
}

export async function timestampToBlockNum(msSinceUnixEpoch) {
  if (process.env.REACT_APP_ACTUAL_ENV !== 'production')
    console.log('timestampToBlockNum')
  const now = Date.now()
  const secondsAgo = (now - msSinceUnixEpoch) / 1000
  const currentTimestamp = now / 1000;
  const currentBlockNum = await web3js.eth.getBlockNumber()
  const estFromBlock = currentBlockNum - secondsAgo/15
  if (estFromBlock <= 0)
    return 0;
  const estFromBlockTimestamp = (await web3js.eth.getBlock(Math.floor(estFromBlock))).timestamp;
  const secondsPerBlock = (currentTimestamp - estFromBlockTimestamp) / ((secondsAgo)/15);
  let fromBlock = Math.floor(currentBlockNum - secondsAgo/secondsPerBlock);
  if (fromBlock < 0) fromBlock = 0;
  return fromBlock
}
