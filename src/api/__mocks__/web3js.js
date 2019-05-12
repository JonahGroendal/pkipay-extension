import Web3 from 'web3'
import ganache from 'ganache-cli'

// let web3js = new Web3(ganache.provider({
//   accounts: [{
//     secretKey: '0xd3adcdbf12b4d79dfc05434d25b32fcc12d264a5be4eabddb1ce7bb5305c0009',
//     balance: '0x' + (5*10**18).toString(16)
//   }]
// }))

// ganache-cli --mnemonic="clown moon flock abuse pool entry movie math float fatal churn donkey"
let web3js = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"))

export default web3js
