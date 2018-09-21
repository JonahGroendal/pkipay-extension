import web3js from './api/web3js'
import { contractGratis } from './api/contractGratis'
import React, { Component } from 'react'
import namehash from 'eth-ens-namehash'
//import cryptoCompare from 'cryptocompare'
import Web3Context from './Web3Context'

export default class Web3ContextProvider extends Component {
  constructor(props) {
    super(props)
    this.state = {
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

    this.initializeTotalDonations = this.initializeTotalDonations.bind(this)
    this.addListenerPendingDonation = this.addListenerPendingDonation.bind(this)
    this.initializeCache = this.initializeCache.bind(this)
    this.handleLog = this.handleLog.bind(this)
  }

  // make this async and use await instead of .then
  componentDidMount() {
    this.initializeEntityAccount()
    .then(accountExists => {
        return this.initializeTotalDonations(accountExists)
    })
    .then(nextBlockNumber => {
      this.addListenerPendingDonation(nextBlockNumber)
    })
    .then(() => {
      this.initializeCache()
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
    const { web3js } = this.props
    const value = {web3js, ...this.state}
    return (
      <Web3Context.Provider value={value}>
        {this.props.children}
      </Web3Context.Provider>
    )
  }

  addListenerPendingDonation(fromBlock) {
    let thisClass = this
    contractGratis.events.PendingDonation({
      filter: {nameHash: this.entityNameHash},
      fromBlock: fromBlock
    })
    .on('data', function(event) {
      thisClass.handleLog(event)
    })
  }

  async initializeEntityAccount() {
    let account = await contractGratis.methods.accounts(this.entityNameHash).call()

    const cache = JSON.parse(JSON.stringify(this.state.cache))
    cache.entity.account = account
    this.setState({
      cache: cache
    })

    let accountExists = (account[0] !== '0x0000000000000000000000000000000000000000')
    return accountExists
  }

  async initializeTotalDonations(accountExists) {
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

  async initializeCache() {
    const cache = JSON.parse(JSON.stringify(this.state.cache))

    //let prices = await cryptoCompare.price('ETH', ['USD', 'EUR', 'GBP', 'JPY', 'CAD'])
    //cache.fiatPerEth = prices
    cache.fiatPerEth = [1,1,1,1,1] // temporary hack!

    let address = await web3js.eth.getBalance(web3js.eth.accounts.wallet[0].address)
    let ethValue = await web3js.utils.fromWei(address)
    cache.account.balances.ETH = Number(ethValue)

    this.setState({
      cache: cache
    })
  }

}
