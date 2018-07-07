import React, { Component } from 'react'
import namehash from 'eth-ens-namehash'
import cryptoCompare from 'cryptocompare'
import Web3Context from './Web3Context'
import Web3 from 'web3';
import gratisABI from '../../client/lib/ethereum/gratisABI.js';

export default class Web3ContextProvider extends Component {
  constructor(props) {
    super(props)
    this.state = {
      web3js: '',
      contractGratis: '',
      cache: {
        account: {
          balances: {
            ETH: '',
          },
        },
        fiatPerEth: {
          USD: "",
          EUR: "",
          GBP: "",
          JPY: "",
          CAD: "",
        },
        entity: {
          accountExists: false,
          account: '',
          totalDonations: ''
        }
      }
    }
    this.entityNameHash = namehash.hash(this.props.shortUrl)

    this.initializeWeb3 = this.initializeWeb3.bind(this)
    this.initializeContractGratis = this.initializeContractGratis.bind(this)
    this.initializeTotalDonations = this.initializeTotalDonations.bind(this)
    this.addListenerPendingDonation = this.addListenerPendingDonation.bind(this)
    this.initializeCache = this.initializeCache.bind(this)
    this.handleLog = this.handleLog.bind(this)
  }

  // make this async and use await instead of .then
  componentDidMount() {
    let web3js = this.initializeWeb3()

    //web3js.eth.accounts.wallet.add("0xd3adcdbf12b4d79dfc05434d25b32fcc12d264a5be4eabddb1ce7bb5305c0009")
    web3js.eth.accounts.wallet.add("0x47088d1c54d1d232db25ce31f669c873c21ecf5c5a3d0790a2b7856e52655798")

    let contractGratis = this.initializeContractGratis(web3js)

    this.initializeEntityAccount(contractGratis)
    .then(accountExists => {
        return this.initializeTotalDonations(contractGratis, accountExists)
    })
    .then(nextBlockNumber => {
      this.addListenerPendingDonation(contractGratis, nextBlockNumber)
    })
    .then(() => {
      this.initializeCache(web3js)
    })
  }

  handleLog(event) {
    switch (event.event) {
      case 'PendingDonation':
        let newTotalDonations = this.state.cache.entity.totalDonations + parseInt(event.returnValues[2], 10)
        const cache = JSON.parse(JSON.stringify(this.state.cache))
        cache.entity.totalDonations = newTotalDonations
        this.setState({
          cache: cache
        })

    }
  }

  render() {
    return (
      <Web3Context.Provider value={this.state}>
        {this.props.children}
      </Web3Context.Provider>
    )
  }

  addListenerPendingDonation(contractGratis, fromBlock) {
    let thisClass = this
    contractGratis.events.PendingDonation({
      filter: {nameHash: this.entityNameHash},
      fromBlock: fromBlock
    })
    .on('data', function(event) {
      thisClass.handleLog(event)
    })
  }

  initializeWeb3() {
    let web3js
    if (typeof web3 !== 'undefined') {
      // Use Mist/MetaMask's provider
      web3js = new Web3(web3.currentProvider)
    } else {
      console.log("Using Infura for web3")
      web3js = new Web3(new Web3.providers.WebsocketProvider("ws://localhost:8545"));
      //web3js = new Web3(new Web3.providers.HttpProvider("https://rinkeby.infura.io/VyklZt7tGRrfmhhyMHG8"))
      //web3js = new Web3(new Web3.providers.WebsocketProvider("wss://rinkeby.infura.io/_ws"))
    }

    this.setState({
      web3js: web3js
    })

    return web3js
  }

  initializeContractGratis(web3js) {
    let gratisAddr = "0xcbb589435491983194b084f12c3c1523a2c0cc21"
    let contractGratis = new web3js.eth.Contract(gratisABI, gratisAddr)

    this.setState({
      contractGratis: contractGratis
    })

    return contractGratis
  }

  async initializeEntityAccount(contractGratis) {
    let account = await contractGratis.methods.accounts(this.entityNameHash).call()

    const cache = JSON.parse(JSON.stringify(this.state.cache))
    cache.entity.account = account
    this.setState({
      cache: cache
    })

    let accountExists = (account[0] !== '0x0000000000000000000000000000000000000000')
    return accountExists
  }

  async initializeTotalDonations(contractGratis, accountExists) {
    let eventName
    accountExists ? eventName='Donation' : eventName='PendingDonation'
    let nameHash = this.entityNameHash

    let pastDonations = await contractGratis.getPastEvents(eventName, {
      filter: {nameHash: nameHash},
      fromBlock: 0
    })

    let donationsThusFar = 0
    pastDonations.forEach(donation => {
      donationsThusFar += parseInt(donation.returnValues[2], 10)
    })

    const cache = JSON.parse(JSON.stringify(this.state.cache))
    cache.entity.totalDonations = donationsThusFar
    this.setState({
      cache: cache
    })

    if (pastDonations.length === 0) return 0
    // Return latest block number + 1
    return pastDonations[pastDonations.length - 1].blockNumber + 1
  }

  async initializeCache(web3js) {
    const cache = JSON.parse(JSON.stringify(this.state.cache))

    let prices = await cryptoCompare.price('ETH', ['USD', 'EUR', 'GBP', 'JPY', 'CAD'])
    cache.fiatPerEth = prices

    let address = await web3js.eth.getBalance(web3js.eth.accounts.wallet[0].address)
    let ethValue = await web3js.utils.fromWei(address)
    cache.account.balances.ETH = Number(ethValue)

    this.setState({
      cache: cache
    })
  }

}
