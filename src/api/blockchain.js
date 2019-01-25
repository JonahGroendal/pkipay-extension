import web3js from './web3js'
import abis from './contractABIs.json'
import strings from './strings'
import namehash from 'eth-ens-namehash'

export default {
  buyTHX,
  createTxBuyThx,
  getEthBalance,
  getDaiBalance,
  subscribeToDaiTransfer,
  getTotalDonations,
  getTotalDonationsFromOneMonth
}

const resolver = new web3js.eth.Contract(abis.Resolver, strings.web3.addresses.Resolver);
const currency = new web3js.eth.Contract(abis.ERC20, strings.web3.addresses.Currency);
const buyMultipleTokens = new web3js.eth.Contract(abis.BuyMultipleTokens, strings.web3.addresses.BuyMultipleTokens);
//const tokenBuyerFactory = new web3js.eth.Contract(abis.TokenBuyerFactory, strings.web3.addresses.TokenBuyerFactory);

export async function createTxBuyThx(address, hostnames, values) {
  if (!Array.isArray(hostnames)) hostnames = [hostnames,];
  if (!Array.isArray(values)) values = [values,];
  const validHostnames = (e, i) => !hostnames[i].includes('#')
  const ensNodes = hostnames.filter(validHostnames).map(h => namehash.hash(h));
  const weiValues = values.filter(validHostnames).map(v => web3js.utils.toWei(v.toString()));
  const abi = await buyMultipleTokens.methods.multiBuy(ensNodes, weiValues).encodeABI();
  return {
    from: address,
    to: strings.web3.addresses.BuyMultipleTokens,
    gas: (300000 * ensNodes.length).toString(),
    data: abi
  }
}

// Deposit currency tokens into BuyMultipleTokens contract for future transfers
export async function depositAllCurrency() {
  const balance = await currency.methods.balanceOf(web3js.eth.accounts.wallet[0].address).call()
  const gasPrice = await web3js.eth.getGasPrice()
  console.log('depositing currency')
  console.log(parseInt(parseInt(gasPrice) * 1.01).toString())
  try {
    await currency.methods.approve(buyMultipleTokens.options.address, balance).send({
      from: web3js.eth.accounts.wallet[0].address,
      gas: 100000,
      // higher gas price to ensure ordering
      gasPrice: parseInt(parseInt(gasPrice) * 1.01).toString()
    })
    await buyMultipleTokens.methods.deposit(web3js.eth.accounts.wallet[0].address, balance).send({
      from: web3js.eth.accounts.wallet[0].address,
      gas: 100000,
      gasPrice: parseInt(parseInt(gasPrice) * 1.01).toString()
    })
  } catch (error) {
    console.log(error)
    return false
  }
  return true
}

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

export async function buyTHX(hostname, amount) {
  const ensNode = namehash.hash(hostname);
  let address = await resolver.methods.payees(ensNode).call();
  if (address === "0x0000000000000000000000000000000000000000") {
    await resolver.methods.createPayee(ensNode).send({
      from: web3js.eth.accounts.wallet[0].address,
      gas: 200000,
    });
    address = await resolver.methods.payees(ensNode).call();
  }
  const thxToken = new web3js.eth.Contract(abis.ThxToken, address);
  const allowance = await currency.methods.allowance(web3js.eth.accounts.wallet[0].address, address).call();
  if ( web3js.utils.toBN(allowance).lt(web3js.utils.toBN(amount)) ) {
    await currency.methods.increaseAllowance(address, amount).send({
      from: web3js.eth.accounts.wallet[0].address,
      gas: 100000,
    });
  }
  return await thxToken.methods.buy(amount).send({
    from: web3js.eth.accounts.wallet[0].address,
    gas: 150000,
  })
}

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
  return await web3js.eth.getBalance(address);
}

export async function getDaiBalance(address) {
  return await currency.methods.balanceOf(address).call();
}

export async function getTokenBalance(address, domainName) {
  let weiValue
  try {
    const ensNode = namehash.hash(domainName)
    const tokenAddress = await resolver.methods.payees(ensNode).call()
    const contract = new web3js.eth.Contract(abis.ERC20, tokenAddress)
    weiValue = await contract.methods.balanceOf(address).call()
  } catch(error) {
    return null
  }

  return parseFloat(web3js.utils.fromWei(weiValue))
}

export async function getTokenBalances(address, domainNames) {
  let balances = []
  for (let i=0; i<domainNames.length; i++) {
    balances.push({
      name: domainNames[i],
      balance: await getTokenBalance(address, domainNames[i])
    })
  }
  return balances
}

export async function subscribeToDaiTransfer(address, onTransfer) {
  const currentBlock = await web3js.eth.getBlockNumber();
  const subscription = currency.events.Transfer({
    filter: [{to: address}, {from: address}],
    fromBlock: currentBlock,
  }).on('data', function(event) {
    getDaiBalance(address).then(onTransfer)
  })
  return subscription.unsubscribe;
}

export async function getTotalDonations(hostname, fromBlock = 0) {
  const ensNode = namehash.hash(hostname);
  const address = await resolver.methods.payees(ensNode).call();
  const thxToken = new web3js.eth.Contract(abis.ThxToken, address);
  const pastBuys = await thxToken.getPastEvents('Buy', { fromBlock: fromBlock })
  const pastRefunds = await thxToken.getPastEvents('Refund', { fromBlock: 0 })
  const totalBuys = pastBuys.reduce((acc, cur) => acc + parseFloat(web3js.utils.fromWei(cur.returnValues[1])), 0);
  const totalRefunds = pastRefunds.reduce((acc, cur) => acc + parseFloat(web3js.utils.fromWei(cur.returnValues[1])), 0);

  return totalBuys - totalRefunds;
}

export async function getTotalDonationsFromOneMonth(hostname) {
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
