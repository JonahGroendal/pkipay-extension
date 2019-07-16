import web3js from './web3js'
import abis from './contractABIs.json'
import namehash from 'eth-ens-namehash'
import TokenSale from 'pkipay-blockchain/build/contracts/TokenSale.json'
import TokenSaleKovan from 'pkipay-blockchain/build/contracts/TokenSaleKovan.json'
import TokenSaleResolver from 'pkipay-blockchain/build/contracts/TokenSaleResolver.json'
import DNSRegistrar from 'dns-on-ens/build/contracts/DNSRegistrar.json'
import TokenBuyer from 'pkipay-blockchain/build/contracts/TokenBuyer.json'
import ERC20 from 'pkipay-blockchain/build/contracts/ERC20.json'
import ERC20Mock from 'pkipay-blockchain/build/contracts/ERC20Mock.json'
import X509ForestOfTrust from 'x509-forest-of-trust/build/contracts/X509ForestOfTrust.json'
import ENSRegistry from '@ensdomains/ens/build/contracts/ENSRegistry.json'

import forge from 'node-forge'
import NodeRSA from 'node-rsa'

export default {
  createTxBuyThx,
  getBalanceETH,
  getBalanceDAI,
  subscribeToDaiTransfer,
  getTotalDonations,
  getTotalDonationsFromOneMonth
}

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
const resolver = new web3js.eth.Contract(TokenSaleResolver.abi, addressOf(TokenSaleResolver));
const registrar = new web3js.eth.Contract(DNSRegistrar.abi, addressOf(DNSRegistrar));
const currency = new web3js.eth.Contract(ERC20.abi, addressOf(ERC20Mock));
const tokenBuyer = new web3js.eth.Contract(TokenBuyer.abi, addressOf(TokenBuyer));
const x509Forest = new web3js.eth.Contract(X509ForestOfTrust.abi, addressOf(X509ForestOfTrust));
const ens = new web3js.eth.Contract(ENSRegistry.abi, addressOf(ENSRegistry));

const dnsRootEnsAddress = (process.env.REACT_APP_ACTUAL_ENV === 'development' || process.env.REACT_APP_ACTUAL_ENV === 'test')
  ? 'dnsroot.test'
  : 'dnsroot.eth'

export async function createTxBuyThx(address, hostnames, values) {
  console.log('createTxBuyThx')
  if (!Array.isArray(hostnames)) hostnames = [hostnames,];
  if (!Array.isArray(values)) values = [values,];
  const validHostnames = (e, i) => hostnames[i] && !hostnames[i].includes('#')
  hostnames = hostnames.filter(validHostnames);
  values = values.filter(validHostnames);
  if (values.length !== hostnames.length)
    throw new Error("Invalid length of values")
  for (let hostname of hostnames) {
    validateHostname(hostname)
  }
  let saleAddrs = []
  let labelHashes = []
  for (let hostname of hostnames) {
    const saleAddr = await resolver.methods.addr(namehash.hash(hostname)).call()
    console.log(saleAddr)
    if (saleAddr === '0x0000000000000000000000000000000000000000') {
      let labels = hostname.split('.').reverse()
      labelHashes = labelHashes.concat(labels.map(web3js.utils.sha3))
    } else {
      saleAddrs.push(saleAddr)
    }
  }
  const weiValues = values.map(v => web3js.utils.toWei(v.toString()));
  console.log(currency.address, saleAddrs, labelHashes, weiValues)
  let abi = tokenBuyer.methods.multiBuy(currency.address, saleAddrs, labelHashes, weiValues).encodeABI()
  return {
    from: address,
    to: tokenBuyer.address,
    gas: (300000 + (300000 * weiValues.length)).toString(),
    data: abi
  }
}

export async function uploadCertAndProveOwnership(address, pemCertChain, pkcs8Key) {
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
      await uploadCertificate(address, pemCertChain[i], pemPubKeys[Math.max(i - 1, 0)])
  }
  const { challengeBytes, blockNum } = await getCertChallengeBytes(address)

  await signAndSubmitCertChallengeBytes(address, challengeBytes, pkcs8Key, pemPubKeys[pemPubKeys.length-1], blockNum)
}

export async function uploadCertificate(address, pemCert, pemParentPubKey) {
  console.log('uploadCertificate')
  const cert = forge.pki.certificateFromPem(pemCert)
  const parentPubKey = forge.pki.publicKeyFromPem(pemParentPubKey)
  const certBytes = '0x' + forge.asn1.toDer(forge.pki.certificateToAsn1(cert)).toHex()
  const parentPubKeyBytes = '0x' + forge.asn1.toDer(forge.pki.publicKeyToAsn1(parentPubKey)).toHex()

  // addCert(bytes memory cert, bytes memory parentPubKey)
  const tx = x509Forest.methods.addCert(certBytes, parentPubKeyBytes)
  const options = { from: address, gas: 2000000 }
  // Make sure it works
    await tx.call(options)
  // Then send
  await tx.send(options)
}

export async function getCertChallengeBytes(address) {
  console.log("getCertChallengeText")
  // signThis() external view returns (bytes memory, uint)
  const res = await x509Forest.methods.signThis().call({ from: address })
  return {
    challengeBytes: res[0].slice(2), // remove "0x"
    blockNum: parseInt(res[1].toString())
  }
}

export async function signAndSubmitCertChallengeBytes(address, challengeBytes, pkcs8Key, pemPubKey, blockNum) {
  console.log('signAndSubmitCertChallengeBytes')
  let pubKey = forge.pki.publicKeyFromPem(pemPubKey)
  let pubKeyBytes = '0x' + forge.asn1.toDer(forge.pki.publicKeyToAsn1(pubKey)).toHex()
  // Calculate signature
  let key = new NodeRSA(pkcs8Key, 'pkcs8')
  let signed = key.sign(challengeBytes, 'hex', 'hex')

  const sha256WithRSAEncryption = "0x2a864886f70d01010b0000000000000000000000000000000000000000000000"
  const tx = x509Forest.methods.proveOwnership(pubKeyBytes, "0x"+signed, blockNum, sha256WithRSAEncryption)
  const options = { from: address, gas: 200000 }
  // Make sure it wont revert
  await tx.call(options)
  // Then do it for real
  await tx.send(options)
}

export async function registerAsDomainOwner(address, hostname) {
  console.log('registerAsDomainOwner')
  validateHostname(hostname)
  const currentOwner = await ens.methods.owner(namehash.hash(hostname)).call();
  if (currentOwner !== address) {
    const labelHashes = hostname.split('.').reverse().map(web3js.utils.sha3)
    // register(bytes32 tld, bytes32 domain, address owner)
    const tx = registrar.methods.register(labelHashes[0], labelHashes[1], address)
    const options = { from: address, gas: 1000000 }
    // first make sure it works
    await tx.call(options)
    await tx.send(options)
  }
}

export async function pointEnsNodeToTokenSaleResolver(address, hostname) {
  console.log('pointEnsNodeToTokenSaleResolver')
  validateHostname(hostname)
  const node = namehash.hash(hostname + '.' + dnsRootEnsAddress) // domain.tld.dnsroot.eth
  const currentResolver = await ens.methods.resolver(node).call();
  if (currentResolver !== resolver.address) {
    // setResolver(bytes32 node, address resolver)
    await ens.methods.setResolver(node, resolver.address).send({ from: address, gas: 100000 })
  }
}

export async function approveTokenBuyer(address) {
  console.log('approveTokenBuyer')
  const balance = await currency.methods.balanceOf(address).call()
  if (balance === "0") return;
  const allowance = await currency.methods.allowance(address, tokenBuyer.address).call()
  const maxUint = "115792089237316195423570985008687907853269984665640564039457584007913129639935"
  if (parseInt(allowance.toString()) > 10**36) return;
  await currency.methods.approve(tokenBuyer.address, maxUint).send({
    from: address,
    gas: 50000
  })
}

// // Deposit currency tokens into BuyMultipleTokens contract for future transfers
// export async function depositAllCurrency() {
//   const balance = await currency.methods.balanceOf(web3js.eth.accounts.wallet[0].address).call()
//   const gasPrice = await web3js.eth.getGasPrice()
//   console.log('depositing currency')
//   console.log(parseInt(parseInt(gasPrice) * 1.01).toString())
//   try {
//     await currency.methods.approve(buyMultipleTokens.address, balance).send({
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
//   const balance = await currency.methods.balanceOf(web3js.eth.accounts.wallet[0].address).call()
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
//     await currency.methods.transfer(tokenBuyerAddress, balance).send({
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
//   const allowance = await currency.methods.allowance(web3js.eth.accounts.wallet[0].address, address).call();
//   if ( web3js.utils.toBN(allowance).lt(web3js.utils.toBN(amount)) ) {
//     await currency.methods.increaseAllowance(address, amount).send({
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

export async function getBalanceETH(address) {
  console.log('getBalanceETH')
  const weiBalance = await web3js.eth.getBalance(address)
  return parseFloat(web3js.utils.fromWei(weiBalance.toString()))
}

export async function getBalanceDAI(address) {
  console.log('getBalanceDAI')
  const weiBalance = await currency.methods.balanceOf(address).call()
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
export async function getTokenBalances(address, tokenNames) {
  console.log('getTokenBalances')
  if (typeof address !== 'string' || address.length !== 42)
    throw new Error("Invalid address")
  let balances = []
  for (let name of tokenNames) {
    const tokenAddr = await resolver.methods.addr(namehash.hash(name)).call()
    if (tokenAddr !== '0x0000000000000000000000000000000000000000') {
      const token = new web3js.eth.Contract(ERC20.abi, tokenAddr)
      const weiBalance = await token.methods.balanceOf(address).call()
      balances.push({
        name: name,
        balance: parseFloat(web3js.utils.fromWei(weiBalance.toString()))
      })
    }
  }
  return balances
}

export async function subscribeToDaiTransfer(address, onTransfer) {
  console.log('subscribeToDaiTransfer')
  const currentBlock = await web3js.eth.getBlockNumber();
  const subscription = currency.events.Transfer({
    filter: [{to: address}, {from: address}],
    fromBlock: currentBlock,
  }).on('data', function(event) {
    getBalanceDAI(address).then(onTransfer)
  })
  return subscription.unsubscribe;
}

export async function getTotalDonations(hostname, fromBlock = 0) {
  console.log('getTotalDonations')
  const ensNode = namehash.hash(hostname);
  //const address = await resolverOld.methods.tokens(ensNode).call();
  const address = await resolver.methods.addr(ensNode).call();
  const thxToken = new web3js.eth.Contract(abis.ThxToken, address);
  const pastBuys = await thxToken.getPastEvents('Buy', { fromBlock: fromBlock })
  const pastRefunds = await thxToken.getPastEvents('Refund', { fromBlock: 0 })
  const totalBuys = pastBuys.reduce((acc, cur) => acc + parseFloat(web3js.utils.fromWei(cur.returnValues[1].toString())), 0);
  const totalRefunds = pastRefunds.reduce((acc, cur) => acc + parseFloat(web3js.utils.fromWei(cur.returnValues[1].toString())), 0);

  return totalBuys - totalRefunds;
}

export async function getDomainOwner(hostname) {
  console.log('getDomainOwner')
  console.log(hostname)
  validateHostname(hostname)
  const ensNode = namehash.hash(hostname);
  const address = await resolver.methods.addr(ensNode).call();
  if (address === "0x0000000000000000000000000000000000000000") {
    const ensDnsNode = namehash.hash(hostname + '.' + dnsRootEnsAddress)
    return await ens.methods.owner(ensDnsNode).call();
  }
  const abi = process.env.REACT_APP_ACTUAL_ENV === 'production'
    ? TokenSale.abi
    : TokenSaleKovan.abi
  const ts = new web3js.eth.Contract(abi, address);
  return await ts.methods.owner().call();
}

export async function getTotalDonationsFromOneMonth(hostname) {
  console.log('getTotalDonationsFromOneMonth')
  const currentTimestamp = Date.now()/1000;
  const currentBlockNum = await web3js.eth.getBlockNumber()
  const estFromBlock = currentBlockNum - 60*60*24*30/15
  if (estFromBlock > 0) {
    const estFromBlockTimestamp = (await web3js.eth.getBlock(estFromBlock)).timestamp;
    const secondsPerBlock = (currentTimestamp - estFromBlockTimestamp) / ((60*60*24*30)/15);
    let fromBlock = Math.floor(currentBlockNum - 60*60*24*30/secondsPerBlock);
    if (fromBlock < 0) fromBlock = 0;
    return await getTotalDonations(hostname, fromBlock);
  }
  return await getTotalDonations(hostname, 0);

}

function validateHostname(hostname) {
  if (hostname.split('.').length !== 2)
    throw new Error("Invalid hostname: '"+hostname+"' is not of the form domain.tld")
}
