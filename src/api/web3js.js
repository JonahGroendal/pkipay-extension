/*global web3*/
import Web3 from 'web3'
import strings from './strings'
import gratisABI from './gratisABI'

// initialize web3js
let web3js
if (typeof web3 !== 'undefined') {
  // Use Mist/MetaMask's providerG
  web3js = new Web3(web3.currentProvider)
} else {
  console.log("Using Infura for web3")
  web3js = new Web3(new Web3.providers.WebsocketProvider("ws://localhost:8545"));
  //web3js = new Web3(new Web3.providers.HttpProvider("https://rinkeby.infura.io/VyklZt7tGRrfmhhyMHG8"))
  //web3js = new Web3(new Web3.providers.WebsocketProvider("wss://rinkeby.infura.io/_ws"))
}

web3js.eth.accounts.wallet.add(strings.web3.addresses.wallet)

export default web3js
