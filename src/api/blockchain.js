import web3js from './web3js'
import abis from './contractABIs.json'
import strings from './strings'
import namehash from 'eth-ens-namehash'

export default {
  buyTHX,
  getEthBalance,
  getDaiBalance,
  subscribeToDaiTransfer,
  getTotalDonations,
  getTotalDonationsFromOneMonth
}

const resolver = new web3js.eth.Contract(abis.Resolver, strings.web3.addresses.resolver);
const currency = new web3js.eth.Contract(abis.ERC20, strings.web3.addresses.currency);

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

export async function getEthBalance() {
  return web3js.eth.getBalance(web3js.eth.accounts.wallet[0].address);
}

export async function getDaiBalance() {
  return currency.methods.balanceOf(web3js.eth.accounts.wallet[0].address).call();
}

export async function subscribeToDaiTransfer(onTransfer) {
  const myaddress = web3js.eth.accounts.wallet[0].address;
  const currentBlock = await web3js.eth.getBlockNumber();
  const subscription = currency.events.Transfer({
    filter: [{to: myaddress}, {from: myaddress}],
    fromBlock: currentBlock,
  }).on('data', function(event) {
    getDaiBalance().then(onTransfer)
  })
  return subscription.unsubscribe;
}

export async function getTotalDonations(hostname, fromBlock = 0) {
  const ensNode = namehash.hash(hostname);
  const address = await resolver.methods.payees(ensNode).call();
  const thxToken = new web3js.eth.Contract(abis.ThxToken, address);
  const pastBuys = await thxToken.getPastEvents('Buy', { fromBlock: fromBlock })
  console.log("Past buys:")
  console.log(pastBuys)
  if (pastBuys.length === 0) return 0;
  const pastRefunds = await thxToken.getPastEvents('Refund', { fromBlock: 0 })
  const totalBuys = pastBuys.reduce((a,b) => parseFloat(a.returnValues[1]) + parseFloat(b.returnValues[1]));
  const totalRefunds = pastRefunds.reduce((a,b) => parseFloat(a.returnValues[1]) + parseFloat(b.returnValues[1]));

  return totalBuys - totalRefunds;
}

export async function getTotalDonationsFromOneMonth(hostname) {
  const currentTimestamp = Date.now()/1000;
  const timestamp = await web3js.eth.getBlock((await web3js.eth.getBlockNumber()) - 15*60*60*24*30).timestamp;
  const secondsPerBlock = (currentTimestamp - timestamp) / 15*60*60*24*30;
  let fromBlock = await web3js.eth.getBlockNumber() - secondsPerBlock*60*60*24*30;
  if (fromBlock < 0) fromBlock = 0;
  return getTotalDonations(hostname, fromBlock);
}
