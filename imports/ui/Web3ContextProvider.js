import React, { Component } from 'react'
import namehash from 'eth-ens-namehash'
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
    this.handleLog = this.handleLog.bind(this)
  }

  componentDidMount() {
    let web3js = this.initializeWeb3()

    //web3js.eth.accounts.wallet.add("0xd3adcdbf12b4d79dfc05434d25b32fcc12d264a5be4eabddb1ce7bb5305c0009")
    web3js.eth.accounts.wallet.add("0x6a481defa7bfcd4a20bcf8e69d0f4da0839f8f9b2578ba673de3e44d289ef2df")

    let contractGratis = this.initializeContractGratis(web3js)

    this.initializeEntityAccount(contractGratis)
    .then(accountExists => {
        return this.initializeTotalDonations(contractGratis, accountExists)
    })
    .then(nextBlockNumber => {
      this.addListenerPendingDonation(contractGratis, nextBlockNumber)
    })
  }

  handleLog(event) {
    switch (event.event) {
      case 'PendingDonation':
        let newTotalDonations = this.state.cache.entity.totalDonations + parseInt(event.returnValues[2], 10)
        this.setState({
          cache: {entity: {totalDonations: newTotalDonations}}
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
    let gratisAddr = "0xed6b7e8f251a6ae4e62be7d666ac728aa4bd2739"
    let contractGratis = new web3js.eth.Contract(gratisABI, gratisAddr)

    this.setState({
      contractGratis: contractGratis
    })

    return contractGratis
  }

  async initializeEntityAccount(contractGratis) {
    let account = await contractGratis.methods.accounts(this.entityNameHash).call()
    this.setState({
      cache: {entity: {account: account}}
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

    this.setState({
      cache: {entity: {totalDonations: donationsThusFar}}
    })

    // Return latest block number + 1
    return pastDonations[pastDonations.length - 1].blockNumber + 1
  }

}
