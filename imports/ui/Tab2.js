import React, { Component } from 'react'
import FormDonate from './FormDonate.js'
import namehash from 'eth-ens-namehash'
import Web3Context from './Web3Context'

export default class Tab2 extends Component {
  constructor(props) {
    super(props)
    // this.state = {
    //   totalDonations: '',
    // }
    // this.updateTotalDonations()
    //this.contracts = context.drizzle
  }

  // componentDidUpdate(prevProps, prevState, snapshot) {
  //   if (this.props.shortUrl !== prevProps.shortUrl) {
  //     this.updateTotalDonations()
  //   }
  // }

  // async updateTotalDonations() {
  //   let nameHash = namehash.hash(this.props.shortUrl)
  //   let account = await gratisContract.methods.accounts(nameHash).call({
  //     from: web3js.eth.accounts.wallet[0].address
  //   })
  //   let totalDonations = account.
  //   this.setState({
  //     totalDonations: totalDonations
  //   })
  // }

  render() {
    //console.log(this.contracts)
    return (

      <div>
        <h1>Tab2</h1>
        <p>{this.props.shortUrl}</p>
        <Web3Context.Consumer>
          {value => { return (
            <div>
              <p>total donations: {value.cache.entity.totalDonations}</p>
              <p>account exists: {value.cache.entity.accountExists ? 'true' : 'false'}</p>
            </div>
          )}}
        </Web3Context.Consumer>
        <FormDonate shortUrl={this.props.shortUrl} />
      </div>
    );
  }
}
