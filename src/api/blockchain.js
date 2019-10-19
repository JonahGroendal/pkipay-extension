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

import forge from 'node-forge'
import NodeRSA from 'node-rsa'

const addressOf = (artifact) => {
  switch (process.env.REACT_APP_ACTUAL_ENV) {
    case 'development':
      if (artifact.contractName.includes('ERC20'))
        return '0xC4375B7De8af5a38a93548eb8453a498222C4fF2' // Kovan DAI address
      return artifact.networks[42].address;
    case 'test':
      const chainId = Object.keys(artifact.networks).sort((a, b) => b - a)[0]; // sort descending
      return artifact.networks[chainId].address;
    default:
      if (artifact.contractName.includes('ERC20'))
        return '0x89d24A6b4CcB1B6fAA2625fE562bDD9a23260359' // Mainnet DAI address
      return artifact.networks[42].address;
  }
}
const resolver = new web3js.eth.Contract(TokenResolver.abi, addressOf(TokenResolver));
const registrar = new web3js.eth.Contract(DNSRegistrar.abi, addressOf(DNSRegistrar));
const dai = new web3js.eth.Contract(ERC20.abi, addressOf(ERC20Mock));
const api = new web3js.eth.Contract(API.abi, addressOf(API));
const escrow = new web3js.eth.Contract(ENSDonationEscrow.abi, addressOf(ENSDonationEscrow));
const x509Forest = new web3js.eth.Contract(X509ForestOfTrust.abi, addressOf(X509ForestOfTrust));
const ens = new web3js.eth.Contract(ENSRegistry.abi, addressOf(ENSRegistry));
const medianizerAddr = (process.env.REACT_APP_ACTUAL_ENV === 'development' || process.env.REACT_APP_ACTUAL_ENV === 'test')
  ? '0x02998f73FAbb52282664094B0ff87741A1Ce9030'
  : '0x729D19f657BD0614b4985Cf1D82531c67569197B'
const medianizer = new web3js.eth.Contract(IMedianizer.abi, medianizerAddr)

const dnsRootEnsAddress = process.env.REACT_APP_ACTUAL_ENV === 'production'
  ? 'dnsroot.eth'
  : 'dnsroot.test'

export const addresses = {
  'ETH': '0x0000000000000000000000000000000000000000',
  'DAI': dai.options.address
}

export async function apiContractApproved(from, tokenAddr) {
  console.log('apiContractApproved')
  if (!tokenAddr) tokenAddr = addresses.DAI
  console.log('tokenAddr', tokenAddr)
  const allowance = await dai.methods.allowance(from, tokenAddr).call()
  return parseInt(allowance.toString()) > 10**36
}

export function createTxApproveApiContract(from, tokenAddr) {
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

export function createTxDonate(from, tokenAddr, ensDomains, amounts) {
  console.log('createTxDonate')
  if (!Array.isArray(ensDomains)) ensDomains = [ensDomains];
  if (!Array.isArray(amounts)) amounts = [amounts];
  if (amounts.length !== ensDomains.length)
    throw new Error("Parallel arrays have unequal lengths")
  const ensNodes = ensDomains.map(namehash.hash)
  const values = amounts.map(amount => web3js.utils.toWei(amount.toString()))

  return {
    from,
    to: api.options.address,
    gas: 150000 + (32000 * ensNodes.length),  // Exact calculation: 97731 + (30282 * length)
    data: api.methods.multiDonate(dai.options.address, ensNodes, values).encodeABI() // escrow.methods.donate(tokenAddr, ensNode, value).encodeABI()
  }
}

export function createTxDonateETH(from, ensDomains, amounts) {
  console.log('createTxDonateETH')
  if (!Array.isArray(ensDomains)) ensDomains = [ensDomains];
  if (!Array.isArray(amounts)) amounts = [amounts];
  if (amounts.length !== ensDomains.length)
    throw new Error("Parallel arrays have unequal lengths")
  const ensNodes = ensDomains.map(namehash.hash)
  const values = amounts.map(amount => web3js.utils.toWei(amount.toString()))
  const totalValue = web3js.utils.toWei(amounts.reduce((a, b) => a + b).toString())

  return {
    from,
    to: api.options.address,
    gas: 60000 + (42000 * ensDomains.length), // Exact calculation: 22655 + (40795 * length)
    value: totalValue,
    data: api.methods.multiDonateETH(ensNodes, values).encodeABI()
  }
}

/**
 * @param {string[]} amounts - The DAI value of tokens to buy for each token
 */
export function createTxBuyTokens(from, ensDomains, amounts) {
  console.log('createTxBuyTokens');
  if (!Array.isArray(ensDomains)) ensDomains = [ensDomains];
  if (!Array.isArray(amounts)) amounts = [amounts];
  if (amounts.length !== ensDomains.length)
    throw new Error("Parallel arrays have unequal lengths")
  const ensNodes = ensDomains.map(namehash.hash)
  const weiValues = amounts.map(a => web3js.utils.toWei(a.toString()));
  return {
    from,
    to: api.options.address,
    gas: (300000 + (300000 * weiValues.length)).toString(),
    data: api.methods.multiBuy(dai.options.address, ensNodes, weiValues).encodeABI()
  }
}

/**
 * @param {string[]} amount - The number of tokens to sell
 */
export async function createTxSellToken(from, domainName, amount) {
  console.log('createTxSellToken')
  validateDomainName(domainName)
  const txs = []
  const ensNode = namehash.hash(domainName.concat('.', dnsRootEnsAddress))
  const weiValue = web3js.utils.toWei(amount.toString())
  const tokenAddr = await resolver.methods.token(ensNode).call()
  if (tokenAddr === '0x0000000000000000000000000000000000000000')
    throw new Error('Token does not exist')
  const token = new web3js.eth.Contract(ERC20.abi, tokenAddr)
  const tokenSaleAddr = await resolver.methods.tokenSale(ensNode).call()
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

// export async function createTxWithdrawDAI(from, domainName, amount) {
//   console.log('createTxWithdrawDAI')
//   validateDomainName(domainName)
//   const weiAmount = web3js.utils.toWei(amount.toString())
//   const ensNode = namehash.hash(domainName.concat('.', dnsRootEnsAddress))
//   const saleAddr = await resolver.methods.tokenSale(ensNode).call()
//   if (saleAddr === '0x0000000000000000000000000000000000000000')
//     throw new Error('Token sale does not exist');
//   let tokenSale = new web3js.eth.Contract(TokenSale.abi, saleAddr);
//   return {
//     from,
//     to: saleAddr,
//     gas: 100000,
//     data: await tokenSale.methods.withdraw(dai.options.address, from, weiAmount).encodeABI()
//   }
// }

export async function createTxWithdraw(from, saleDomainName, tokenAddr, amount) {
  console.log('createTxWithdrawDAI')
  validateDomainName(saleDomainName)
  const weiAmount = web3js.utils.toWei(amount.toString())
  const ensNode = namehash.hash(saleDomainName.concat('.', dnsRootEnsAddress))
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

export async function createTxWithdrawETH(from, domainName, amount) {
  console.log('createTxWithdrawETH')
  validateDomainName(domainName)
  const weiAmount = web3js.utils.toWei(amount.toString())
  const ensNode = namehash.hash(domainName.concat('.', dnsRootEnsAddress))
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

export function createTxReclaimDonations(from, tokenAddr, ensAddress) {
  console.log('createTxReclaimDonations')
  const ensNode = namehash.hash(ensAddress)
  return {
    from,
    to: escrow.options.address,
    gas: 60000,
    data: escrow.methods.reclaim(tokenAddr, ensNode).ecodeABI()
  }
}

export function createTxReclaimDonationsETH(from, ensAddress) {
  console.log('createTxReclaimDonationsETH')
  const ensNode = namehash.hash(ensAddress)
  return {
    from,
    to: escrow.options.address,
    gas: 30000,
    data: escrow.methods.reclaimETH(ensNode).ecodeABI()
  }
}

export function createTxWithdrawDonations(from, tokenAddr, ensAddress, donors) {
  console.log('createTxWithdrawDonations')
  const ensNode = namehash.hash(ensAddress)
  return {
    from,
    to: escrow.options.address,
    gas: 100000, // gas needed decreases as number of donors increases due to gas refunds
    data: escrow.methods.withdraw(tokenAddr, ensNode, donors, from).encodeABI()
  }
}

export function createTxWithdrawDonationsETH(from, ensAddress, donors) {
  console.log('createTxWithdrawDonationsETH')
  const ensNode = namehash.hash(ensAddress)
  return {
    from,
    to: escrow.options.address,
    gas: 100000, // gas needed decreases as number of donors increases due to gas refunds
    data: escrow.methods.withdrawETH(ensNode, donors, from).encodeABI()
  }
}

// export async function createTxWithdrawAll(from, domainName) {
//   console.log('createTxWithdrawAll')
//   validateDomainName(domainName)
//   const ensNode = namehash.hash(domainName.concat('.', dnsRootEnsAddress))
//   const saleAddr = await resolver.methods.tokenSale(ensNode).call()
//   if (saleAddr === '0x0000000000000000000000000000000000000000')
//     throw new Error('Token sale does not exist');
//   let tokenSale = new web3js.eth.Contract(TokenSale.abi, saleAddr);
//   const daiValue = (await dai.methods.balanceOf(saleAddr).call()).toString()
//   const ethValue = await web3js.eth.getBalance(saleAddr)
//   let txObjects = [];
//   if (parseInt(daiValue) > 0)
//     txObjects.push({
//       from,
//       to: saleAddr,
//       gas: 100000,
//       data: await tokenSale.methods.withdrawDAI(from, daiValue).encodeABI()
//     });
//   if (parseInt(ethValue) > 0)
//     txObjects.push({
//       from,
//       to: saleAddr,
//       gas: 100000,
//       data: await tokenSale.methods.withdrawETH(from, ethValue).encodeABI()
//     });
//   return {
//     txObjects,
//     daiValue: parseFloat(web3js.utils.fromWei(daiValue)),
//     ethValue: parseFloat(web3js.utils.fromWei(ethValue))
//   }
// }

// export async function createTxTransferDai(from, domainName, amount) {
//   console.log('createTxTransferDai')
//   validateDomainName(domainName)
//   domainName = domainName.concat('.', dnsRootEnsAddress)
//   const ensNode = namehash.hash(domainName)
//   const weiAmount = web3js.utils.toWei(amount.toString())
//   const toResolverAddr = await ens.methods.resolver(ensNode).call()
//   if (toResolverAddr === '0x0000000000000000000000000000000000000000')
//     throw new Error('Resolver is not set for "'.concat(domainName).concat('"'))
//   const toResolver = new web3js.eth.Contract(TokenResolver.abi, toResolverAddr)
//   const to = await toResolver.methods.addr(ensNode).call()
//   if (to === '0x0000000000000000000000000000000000000000')
//     throw new Error('"'.concat(domainName).concat('" resolves to the zero address'))
//   return {
//     from,
//     to: dai.options.address,
//     gas: "70000",
//     data: dai.methods.transfer(to, weiAmount).encodeABI()
//   }
// }

export async function createTxTransfer(from, toEnsDomain, tokenAddr, amount) {
  console.log('createTxTransferTokens')
  const weiAmount = web3js.utils.toWei(amount.toString())
  const to = await resolveAddress(toEnsDomain)
  if (to === '0x0000000000000000000000000000000000000000')
    throw new Error('"'.concat(toEnsDomain, '" resolves to the zero address'))
  const token = new web3js.eth.Contract(ERC20.abi, tokenAddr)
  return {
    from,
    to: tokenAddr,
    gas: 70000,
    data: token.methods.transfer(to, weiAmount).encodeABI()
  }
}

export async function createTxTransferETH(from, toEnsDomain, amount) {
  console.log('createTxTransferETH')
  const weiAmount = web3js.utils.toWei(amount.toString())
  const to = await resolveAddress(toEnsDomain)
  if (to === '0x0000000000000000000000000000000000000000')
    throw new Error('"'.concat(toEnsDomain, '" resolves to the zero address'))
  return {
    from,
    to,
    value: weiAmount,
    gas: 24000
  }
}

export async function getPriceOfETHInUSD() {
  return parseFloat(web3js.utils.fromWei(web3js.utils.hexToNumberString(await medianizer.methods.read().call())))
}

export function domainNameToEnsAddr(domainName) {
  return domainName.concat('.', dnsRootEnsAddress)
}

export async function resolveAddress(ensAddress) {
  const ensNode = namehash.hash(ensAddress)
  const ensResolverAddr = await ens.methods.resolver(ensNode).call()
  if (ensResolverAddr === '0x0000000000000000000000000000000000000000')
    throw new Error('Resolver is not set for "'.concat(ensAddress, '"'))
  const ensResolver = new web3js.eth.Contract(TokenResolver.abi, ensResolverAddr)
  return await ensResolver.methods.addr(ensNode).call()
}

export async function resolveToken(ensAddress) {
  console.log('resolveToken')
  const ensNode = namehash.hash(ensAddress)
  const ensResolverAddr = await ens.methods.resolver(ensNode).call()
  if (ensResolverAddr === '0x0000000000000000000000000000000000000000')
    throw new Error('Resolver is not set for "'.concat(ensAddress, '"'))
  const ensResolver = new web3js.eth.Contract(TokenResolver.abi, ensResolverAddr)
  return await ensResolver.methods.token(ensNode).call()
}

export async function getDomainOwner(domainName) {
  console.log('getDomainOwner')
  validateDomainName(domainName)
  const ensNode = namehash.hash(domainName.concat('.', dnsRootEnsAddress));
  const tokenAddr = await resolver.methods.token(ensNode).call();
  let owner;
  if (tokenAddr === "0x0000000000000000000000000000000000000000") {
    owner = await ens.methods.owner(ensNode).call();
  } else {
    const ownedContract = new web3js.eth.Contract(OwnedByENSNode.abi, tokenAddr);
    owner = await ownedContract.methods.owner().call();
  }
  return owner;
}

export async function getPendingDonations(from) {
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

export async function getPendingWithdrawals(ensAddress) {
  console.log('getPendingWithdrawals')
  const donee = namehash.hash(ensAddress)
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

export async function uploadCertAndProveOwnership(from, pemCertChain, pkcs8Key) {
  console.log('uploadCertAndProveOwnership')
  let pemPubKeys = []
  let certIds = []
  let pubKey;
  pemCertChain.forEach(pem => {
    pubKey = forge.pki.certificateFromPem(pem).publicKey
    pemPubKeys.push(forge.pki.publicKeyToPem(pubKey))
    certIds.push(web3js.utils.sha3('0x' + forge.asn1.toDer(forge.pki.publicKeyToAsn1(pubKey)).toHex()))
  })

  for (let i=0; i<pemCertChain.length; i++) {
    if (parseInt(await x509Forest.methods.validNotAfter(certIds[i]).call()) === 0)
      await uploadCertificate(from, pemCertChain[i], pemPubKeys[Math.max(i - 1, 0)])
  }
  const { challengeBytes, blockNum } = await getCertChallengeBytes(from)

  await signAndSubmitCertChallengeBytes(from, challengeBytes, pkcs8Key, pemPubKeys[pemPubKeys.length-1], blockNum)
}

export async function uploadCertificate(from, pemCert, pemParentPubKey) {
  console.log('uploadCertificate')
  const cert = forge.pki.certificateFromPem(pemCert)
  const parentPubKey = forge.pki.publicKeyFromPem(pemParentPubKey)
  const certBytes = '0x' + forge.asn1.toDer(forge.pki.certificateToAsn1(cert)).toHex()
  const parentPubKeyBytes = '0x' + forge.asn1.toDer(forge.pki.publicKeyToAsn1(parentPubKey)).toHex()

  // addCert(bytes memory cert, bytes memory parentPubKey)
  const tx = x509Forest.methods.addCert(certBytes, parentPubKeyBytes)
  const options = { from, gas: 2000000 }
  // Make sure it works
  await tx.call(options)
  // Then send
  await tx.send(options)
}

export async function getCertChallengeBytes(from) {
  console.log("getCertChallengeText")
  // signThis() external view returns (bytes memory, uint)
  const res = await x509Forest.methods.signThis().call({ from })
  return {
    challengeBytes: res[0].slice(2), // remove "0x"
    blockNum: parseInt(res[1].toString())
  }
}

export async function signAndSubmitCertChallengeBytes(from, challengeBytes, pkcs8Key, pemPubKey, blockNum) {
  console.log('signAndSubmitCertChallengeBytes')
  let pubKey = forge.pki.publicKeyFromPem(pemPubKey)
  let pubKeyBytes = '0x' + forge.asn1.toDer(forge.pki.publicKeyToAsn1(pubKey)).toHex()
  // Calculate signature
  let key = new NodeRSA(pkcs8Key, 'pkcs8')
  let signed = key.sign(challengeBytes, 'hex', 'hex')

  const sha256WithRSAEncryption = "0x2a864886f70d01010b0000000000000000000000000000000000000000000000"
  const tx = x509Forest.methods.proveOwnership(pubKeyBytes, "0x"+signed, blockNum, sha256WithRSAEncryption)
  const options = { from, gas: 200000 }
  // Make sure it wont revert
  await tx.call(options)
  // Then do it for real
  await tx.send(options)
}

export async function registerAsDomainOwner(from, domainName) {
  console.log('registerAsDomainOwner')
  validateDomainName(domainName)
  const ensNode = namehash.hash(domainName.concat('.', dnsRootEnsAddress))
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

export async function pointEnsNodeToResolver(from, domainName) {
  console.log('pointEnsNodeToResolver')
  validateDomainName(domainName)
  const node = namehash.hash(domainName.concat('.', dnsRootEnsAddress)) // domain.tld.dnsroot.eth
  const currentResolver = await ens.methods.resolver(node).call();
  if (currentResolver !== resolver.options.address) {
    // setResolver(bytes32 node, address resolver)
    await ens.methods.setResolver(node, resolver.options.address).send({ from, gas: 100000 })
  }
}

export async function pointResolverAddrToTokenSale(from, domainName) {
  console.log('pointResolverAddrToTokenSale')
  validateDomainName(domainName)
  const ensNode = namehash.hash(domainName.concat('.', dnsRootEnsAddress))
  let tokenSaleAddr = await resolver.methods.tokenSale(ensNode).call()
  if (tokenSaleAddr === '0x0000000000000000000000000000000000000000') {
    await resolver.methods.createTokenAndSale(ensNode).send({ from, gas: 400000 })
    tokenSaleAddr = await resolver.methods.tokenSale(ensNode).call()
  }
  await resolver.methods.setAddr(ensNode, tokenSaleAddr).send({ from, gas: 100000 })
}

export async function pointResolverAddrToSelf(from, ensName) {
  console.log('pointResolverAddrToSelf')
  const ensNode = namehash.hash(ensName)
  await resolver.methods.setAddr(ensNode, from).send({ from, gas: 100000 })
}

export async function getTokenSaleInfo(domainName) {
  console.log('getTokenSaleInfo')
  validateDomainName(domainName)
  let buyPrice = 1
  let sellPrice = 1
  let reservesDAI = 0
  let reservesETH = 0
  const node = namehash.hash(domainName.concat('.', dnsRootEnsAddress))
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

export async function getTokenInfo(domainName) {
  console.log('getTokenInfo')
  validateDomainName(domainName)
  let totalSupply = 0
  const node = namehash.hash(domainName.concat('.', dnsRootEnsAddress))
  const address = await resolver.methods.token(node).call()
  if (address !== '0x0000000000000000000000000000000000000000') {
    const token = new web3js.eth.Contract(ERC20.abi, address)
    totalSupply = parseFloat(web3js.utils.fromWei(await token.methods.totalSupply().call()))
  }
  return { totalSupply }
}

// export async function approveTokenBuyer(address) {
//   console.log('approveTokenBuyer')
//   const balance = await dai.methods.balanceOf(address).call()
//   if (balance === "0") return;
//   const allowance = await dai.methods.allowance(address, tokenBuyer.options.address).call()
//   const maxUint = "115792089237316195423570985008687907853269984665640564039457584007913129639935"
//   if (parseInt(allowance.toString()) > 10**36) return;
//   await dai.methods.approve(tokenBuyer.options.address, maxUint).send({
//     from: address,
//     gas: 50000
//   })
// }

// // Deposit dai tokens into BuyMultipleTokens contract for future transfers
// export async function depositAllCurrency() {
//   const balance = await dai.methods.balanceOf(web3js.eth.accounts.wallet[0].address).call()
//   const gasPrice = await web3js.eth.getGasPrice()
//   console.log('depositing dai')
//   console.log(parseInt(parseInt(gasPrice) * 1.01).toString())
//   try {
//     await dai.methods.approve(buyMultipleTokens.address, balance).send({
//       from: web3js.eth.accounts.wallet[0].address,
//       gas: 100000,
//       // higher gas price to ensure ordering
//       gasPrice: parseInt(parseInt(gasPrice) * 1.01).toString()
//     })
//     await buyMultipleTokens.methods.deposit(web3js.eth.accounts.wallet[0].address, balance).send({
//       from: web3js.eth.accounts.wallet[0].address,
//       gas: 100000,
//       gasPrice: parseInt(parseInt(gasPrice) * 1.01).toString()
//     })
//   } catch (error) {
//     console.log(error)
//     return false
//   }
//   return true
// }

// export async function createTokenBuyer() {
//   const balance = await dai.methods.balanceOf(web3js.eth.accounts.wallet[0].address).call()
//   const gasPrice = await web3js.eth.getGasPrice()
//   console.log(parseInt(parseInt(gasPrice) * 1.01).toString())
//   let result
//   try {
//     result = await tokenBuyerFactory.methods.create().send({
//       from: web3js.eth.accounts.wallet[0].address,
//       gas: 200000,
//       // higher gas price to ensure ordering
//       gasPrice: parseInt(parseInt(gasPrice) * 1.01).toString()
//     })
//     const tokenBuyerAddress = result.events.TokenBuyerCreated.returnValues[0]
//     await dai.methods.transfer(tokenBuyerAddress, balance).send({
//       from: web3js.eth.accounts.wallet[0].address,
//       gas: 100000,
//       gasPrice: parseInt(parseInt(gasPrice) * 1.01).toString()
//     })
//   } catch (error) {
//     console.log(error)
//     return null
//   }
//   return tokenBuyerAddress
// }

// export async function buyTHX(hostname, amount) {
//   const ensNode = namehash.hash(hostname);
//   let address = await resolver.methods.tokens(ensNode).call();
//   if (address === "0x0000000000000000000000000000000000000000") {
//     await resolver.methods.createToken(ensNode).send({
//       from: web3js.eth.accounts.wallet[0].address,
//       gas: 200000,
//     });
//     address = await resolver.methods.tokens(ensNode).call();
//   }
//   const thxToken = new web3js.eth.Contract(abis.ThxToken, address);
//   const allowance = await dai.methods.allowance(web3js.eth.accounts.wallet[0].address, address).call();
//   if ( web3js.utils.toBN(allowance).lt(web3js.utils.toBN(amount)) ) {
//     await dai.methods.increaseAllowance(address, amount).send({
//       from: web3js.eth.accounts.wallet[0].address,
//       gas: 100000,
//     });
//   }
//   return await thxToken.methods.buy(amount).send({
//     from: web3js.eth.accounts.wallet[0].address,
//     gas: 150000,
//   })
// }

// export async function buyTHXFromSubs(subscriptions) {
//   let recipients = []
//   let amounts = []
//   for (let i=0; i<subscriptions.length; i++) {
//     if (subscriptions[i].hostname !== "gratiis#mostViewedSites") {
//       recipients.push(subscriptions[i].hostname)
//       amounts.push(subscriptions[i].amount)
//     }
//   }
//   const mvsIndex = subscriptions.findIndex(sub => sub.hostname === "gratiis#mostViewedSites")
//   if (subscriptions[mvsIndex].amount !== 0) { // if Most Viewed Sites are being paid
//     let views = await getViews()
//     for (let view in views) {
//       recipients.push(view.hostname)
//       amounts.push(view.share * subscriptions[0].amount)
//     }
//   }
//   for (let i=0; i<recipients.length; i++) {
//     buyThx(recipients[i], amounts[i])
//   }
// }

export async function getBalanceETH(from) {
  console.log('getBalanceETH')
  const weiBalance = await web3js.eth.getBalance(from)
  return parseFloat(web3js.utils.fromWei(weiBalance.toString()))
}

export async function getBalanceDAI(from) {
  console.log('getBalanceDAI')
  const weiBalance = await dai.methods.balanceOf(from).call()
  return parseFloat(web3js.utils.fromWei(weiBalance.toString()))
}

export async function getBalanceERC20(from, tokenAddr) {
  const token = new web3js.eth.Contract(ERC20.abi, tokenAddr)
  const weiBalance = await token.methods.balanceOf(from).call()
  return parseFloat(web3js.utils.fromWei(weiBalance.toString()))
}

// export async function getTokenBalance(address, domainName) {
//   let weiValue
//   try {
//     const ensNode = namehash.hash(domainName)
//     const tokenAddress = await resolver.methods.tokens(ensNode).call()
//     const contract = new web3js.eth.Contract(abis.ERC20, tokenAddress)
//     weiValue = await contract.methods.balanceOf(address).call()
//   } catch(error) {
//     return null
//   }
//
//   return parseFloat(web3js.utils.fromWei(weiValue))
// }
//
// export async function getTokenBalances(address, domainNames) {
//   let balances = []
//   for (let i=0; i<domainNames.length; i++) {
//     balances.push({
//       name: domainNames[i],
//       balance: await getTokenBalance(address, domainNames[i])
//     })
//   }
//   return balances
// }

// export async function getTokenBalances(address) {
//   console.log('getTokenBalances')
//   if (typeof address !== 'string' || address.length !== 42)
//     throw new Error("Invalid address")
//   let balances = {}
//   let events = await tokenBuyer.getPastEvents('Buy', {fromBlock: 0, filter: {buyer: address}})
//   for (const event of events) {
//     if (!(event.returnValues.token in balances)) {
//       const contract = new web3js.eth.Contract(abis.TokenSale, event.returnValues.token)
//       balances[event.returnValues.token] = {
//         name: await contract.methods.name().call(),
//         balance: parseFloat(web3js.utils.fromWei((await contract.methods.balanceOf(address).call()).toString()))
//       }
//     }
//   }
//   return Object.values(balances)
// }
export async function getTokenBalances(from, tokenNames) {
  console.log('getTokenBalances')
  if (typeof from !== 'string' || from.length !== 42)
    throw new Error("Invalid address")
  let balances = []
  for (let domainName of tokenNames) {
    const tokenAddr = await resolver.methods.token(namehash.hash(domainName.concat('.', dnsRootEnsAddress))).call()
    if (tokenAddr !== '0x0000000000000000000000000000000000000000') {
      const token = new web3js.eth.Contract(ERC20.abi, tokenAddr)
      const weiBalance = await token.methods.balanceOf(from).call()
      balances.push({
        name: domainName,
        balance: parseFloat(web3js.utils.fromWei(weiBalance.toString()))
      })
    }
  }
  return balances
}

export async function subscribeToDaiTransfer(from, onTransfer) {
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
  console.log('getTotalContributions')
  const ensNode = namehash.hash(ensName);

  const events = await api.getPastEvents('allEvents', {
    filter: { node: ensNode },
    fromBlock: 0
  })

  const byToken = {}
  events.forEach(event => {
    if (!byToken[event.returnValues.currency])
      byToken[event.returnValues.currency] = 0
    byToken[event.returnValues.currency] += parseFloat(web3js.utils.fromWei(event.returnValues.value))
  })

  return byToken
}

export async function getTotalContributionsFromOneMonth(ensName) {
  console.log('getTotalDonationsFromOneMonth')
  const currentTimestamp = Date.now()/1000;
  const currentBlockNum = await web3js.eth.getBlockNumber()
  const estFromBlock = currentBlockNum - 60*60*24*30/15
  if (estFromBlock > 0) {
    const estFromBlockTimestamp = (await web3js.eth.getBlock(estFromBlock)).timestamp;
    const secondsPerBlock = (currentTimestamp - estFromBlockTimestamp) / ((60*60*24*30)/15);
    let fromBlock = Math.floor(currentBlockNum - 60*60*24*30/secondsPerBlock);
    if (fromBlock < 0) fromBlock = 0;
    return await getTotalContributions(ensName, fromBlock);
  }
  return await getTotalContributions(ensName, 0);

}

function validateDomainName(domainName) {
  if (domainName.split('.').length !== 2)
    throw new Error("Invalid domain name: '"+domainName+"' is not of the form domain.tld")
}
