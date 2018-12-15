import web3js from './api/web3js'
import { contractGratis } from './api/contractGratis'
import React, { Component } from 'react'
import namehash from 'eth-ens-namehash'
import cryptoCompare from 'cryptocompare'
import Web3Context from './Web3Context'

export default class Web3ContextProvider extends Component {
  constructor(props) {
    super(props)
    this.state = {
      subject: {
        balances: {
          ETH: '',
        },
      },
      fiatPerEth: {
        USD: '',
        EUR: '',
        GBP: '',
        JPY: '',
        CAD: '',
      },
      object: {
        accountExists: false,
        account: '',
        donationsTotal: 0,
        donationsLastMonth: 0,
        tokenSupply: 0,
      }
    }
    this.objectNameHash = namehash.hash(this.props.shortUrl)

    this.initializeTotalDonations = this.initializeTotalDonations.bind(this)
    this.addListenerPendingDonation = this.addListenerPendingDonation.bind(this)
    this.initializeCache = this.initializeCache.bind(this)
    this.handleLog = this.handleLog.bind(this)
  }

  // make this async and use await instead of .then
  componentDidMount() {
    this.initializeObjectAccount()
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
        let newTotalDonations = this.state.object.totalDonations + parseInt(event.returnValues[2], 10)
        const object = JSON.parse(JSON.stringify(this.state.object))
        object.totalDonations = newTotalDonations
        this.setState({ object: object })
        break

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
      filter: {nameHash: this.objectNameHash},
      fromBlock: fromBlock
    })
    .on('data', function(event) {
      thisClass.handleLog(event)
    })
  }

  async initializeObjectAccount() {
    let account = await contractGratis.methods.accounts(this.objectNameHash).call()

    const object = JSON.parse(JSON.stringify(this.state.object))
    object.account = account
    this.setState({ object: object })

    const accountExists = (account[0] !== '0x0000000000000000000000000000000000000000')
    return accountExists
  }

  async initializeTotalDonations(accountExists) {
    let eventName
    accountExists ? eventName='Donation' : eventName='PendingDonation'
    let nameHash = this.objectNameHash

    let pastDonations = await contractGratis.getPastEvents(eventName, {
      filter: {nameHash: nameHash},
      fromBlock: 0
    })

    let donationsThusFar = 0
    pastDonations.forEach(donation => {
      donationsThusFar += parseInt(donation.returnValues[2], 10)
    })

    let object = JSON.parse(JSON.stringify(this.state.object))
    object.totalDonations = donationsThusFar
    this.setState({
      object: object
    })

    if (pastDonations.length === 0) return 0
    // Return latest block number + 1
    return pastDonations[pastDonations.length - 1].blockNumber + 1
  }

  async initializeCache() {
    let subject = JSON.parse(JSON.stringify(this.state.subject))

    const fiatPerEth = await cryptoCompare.price('ETH', ['USD', 'EUR', 'GBP', 'JPY', 'CAD'])

    let weiValue = await web3js.eth.getBalance(web3js.eth.accounts.wallet[0].address)
    let ethValue = await web3js.utils.fromWei(weiValue)
    subject.balances.ETH = Number(ethValue)

    this.setState({
      fiatPerEth: fiatPerEth,
      subject: subject,
    })
  }

}
