// /*global web3*/
import Web3 from 'web3'

// // initialize web3js
// let web3js
// if (typeof web3 !== 'undefined') {
//   // Use Mist/MetaMask's providerG
//   console.log('Using metamask')
//   web3js = new Web3(web3.currentProvider)
// } else {
//   console.log("Using Infura for web3")
//   //web3js = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
//   //web3js = new Web3(new Web3.providers.WebsocketProvider("ws://localhost:8545"));
//   web3js = new Web3(new Web3.providers.HttpProvider("https://rinkeby.infura.io/v3/48899b10645a48e189e345be4be19ece"))
//   //web3js = new Web3(new Web3.providers.WebsocketProvider("wss://rinkeby.infura.io/ws/v3/48899b10645a48e189e345be4be19ece"))
// }

// let web3js = new Web3(new Web3.providers.HttpProvider("https://rinkeby.infura.io/v3/48899b10645a48e189e345be4be19ece"))
const web3js = new Web3(
  new Web3.providers.WebsocketProvider("wss://kovan.infura.io/ws/v3/48899b10645a48e189e345be4be19ece"),
  undefined,
  { transactionConfirmationBlocks: 1 }
)

export default web3js
