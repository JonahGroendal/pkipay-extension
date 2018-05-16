import Web3 from 'web3';
import vaultABI from './ethereum/vaultABI.js';
import mockChrome from '../../imports/test/mockChrome.js';

if (typeof web3 !== 'undefined') {
  // Use Mist/MetaMask's provider
  web3js = new Web3(web3.currentProvider);
} else {
  console.log("Using localhost for web3");
  //web3js = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
  web3js = new Web3(new Web3.providers.HttpProvider("https://rinkeby.infura.io/VyklZt7tGRrfmhhyMHG8"));
}

console.log(web3js.eth.accounts.wallet.add("0xd3adcdbf12b4d79dfc05434d25b32fcc12d264a5be4eabddb1ce7bb5305c0009"));

vaultContract = new web3js.eth.Contract(vaultABI, "0x6cf3e7465848556d298b6966f4cefb096eb7d705");

// For testing:
// if (typeof chrome === 'undefined') {
//   console.log('Using mock chrome object')
//   chrome = mockChrome;
// }
