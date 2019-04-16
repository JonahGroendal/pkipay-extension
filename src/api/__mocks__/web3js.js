import Web3 from 'web3'
import ganache from 'ganache-cli'

let web3js = new Web3(ganache.provider({
  accounts: [{
    secretKey: '0xd3adcdbf12b4d79dfc05434d25b32fcc12d264a5be4eabddb1ce7bb5305c0009',
    balance: '0x' + (5*10**18).toString(16)
  }]
}))

export default web3js
