import web3js from './web3js'
import abis from './contractABIs.json'
import strings from './strings'
import namehash from 'eth-ens-namehash'

export default {
  createTxBuyThx,
  getEthBalance,
  getCurrencyBalance,
  subscribeToDaiTransfer,
  getTotalDonations,
  getTotalDonationsFromOneMonth
}

const resolver = new web3js.eth.Contract(abis.Resolver, strings.web3.addresses.Resolver);
const currency = new web3js.eth.Contract(abis.ERC20, strings.web3.addresses.Currency);
//const buyMultipleTokens = new web3js.eth.Contract(abis.BuyMultipleTokens, strings.web3.addresses.BuyMultipleTokens);
const tokenBuyer = new web3js.eth.Contract(abis.TokenBuyer, strings.web3.addresses.TokenBuyer);

export async function createTxBuyThx(address, hostnames, values) {
  if (!Array.isArray(hostnames)) hostnames = [hostnames,];
  if (!Array.isArray(values)) values = [values,];
  const validHostnames = (e, i) => hostnames[i] && !hostnames[i].includes('#')
  // const ensNodes = hostnames.filter(validHostnames).map(h => namehash.hash(h));
  const toBytes32 = str => '0x' + (new Buffer(str).toString('hex').padStart(64, "0"))
  const to = hostnames.filter(validHostnames).map(toBytes32)
  const weiValues = values.filter(validHostnames).map(v => web3js.utils.toWei(v.toString()));
  let abi
  //try { abi = await tokenBuyer.methods.multiBuy(ensNodes, weiValues).encodeABI() }
  try { abi = await tokenBuyer.methods.multiBuy(to, weiValues).encodeABI() }
  catch (error) { throw error }
  return {
    from: address,
    to: tokenBuyer.options.address,
    gas: (300000 + (300000 * to.length)).toString(),
    data: abi
  }
}

export async function approveTokenBuyer() {
  console.log('approveTokenBuyer')
  const balance = await currency.methods.balanceOf(web3js.eth.accounts.wallet[0].address).call()
  if (balance === "0") return;
  const allowance = await currency.methods.allowance(web3js.eth.accounts.wallet[0].address, tokenBuyer.options.address).call()
  const maxUint = "115792089237316195423570985008687907853269984665640564039457584007913129639935"
  if (allowance === maxUint) return;
  return await currency.methods.approve(tokenBuyer.options.address, maxUint).send({
    from: web3js.eth.accounts.wallet[0].address,
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
//     await currency.methods.approve(buyMultipleTokens.options.address, balance).send({
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

export async function getEthBalance(address) {
  const weiBalance = await web3js.eth.getBalance(address)
  return parseFloat(web3js.utils.fromWei(weiBalance))
}

export async function getCurrencyBalance(address) {
  const weiBalance = await currency.methods.balanceOf(address).call()
  return parseFloat(web3js.utils.fromWei(weiBalance))
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

export async function getTokenBalances(address) {
  if (typeof address !== 'string' || address.length !== 42)
    throw "Invalid address"
  let balances = {}
  let events = await tokenBuyer.getPastEvents('Buy', {fromBlock: 0, filter: {buyer: address}})
  console.log(events)
  for (const event of events) {
    if (!(event.returnValues.token in balances)) {
      const contract = new web3js.eth.Contract(abis.TokenSale, event.returnValues.token)
      balances[event.returnValues.token] = {
        name: await contract.methods.name().call(),
        balance: parseFloat(web3js.utils.fromWei(await contract.methods.balanceOf(address).call()))
      }
    }
  }
  console.log(balances)
  return Object.values(balances)
}

export async function subscribeToDaiTransfer(address, onTransfer) {
  const currentBlock = await web3js.eth.getBlockNumber();
  const subscription = currency.events.Transfer({
    filter: [{to: address}, {from: address}],
    fromBlock: currentBlock,
  }).on('data', function(event) {
    getCurrencyBalance(address).then(onTransfer)
  })
  return subscription.unsubscribe;
}

export async function getTotalDonations(hostname, fromBlock = 0) {
  console.log('getTotalDonations')
  const ensNode = namehash.hash(hostname);
  const address = await resolver.methods.tokens(ensNode).call();
  const thxToken = new web3js.eth.Contract(abis.ThxToken, address);
  const pastBuys = await thxToken.getPastEvents('Buy', { fromBlock: fromBlock })
  const pastRefunds = await thxToken.getPastEvents('Refund', { fromBlock: 0 })
  const totalBuys = pastBuys.reduce((acc, cur) => acc + parseFloat(web3js.utils.fromWei(cur.returnValues[1])), 0);
  const totalRefunds = pastRefunds.reduce((acc, cur) => acc + parseFloat(web3js.utils.fromWei(cur.returnValues[1])), 0);

  return totalBuys - totalRefunds;
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
