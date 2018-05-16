import React, { Component } from 'react';
import FormDonate from './FormDonate.js';
import namehash from 'eth-ens-namehash';

export default class Tab2 extends Component {
  constructor(props) {
    super(props)
    this.state = {
      totalDonations: '',
    }
    this.updateTotalDonations()
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.props.shortUrl !== prevProps.shortUrl) {
      this.updateTotalDonations()
    }
  }

  async updateTotalDonations() {
    let nameHash = namehash.hash(this.props.shortUrl)
    let totalDonations = await vaultContract.methods.deposits(nameHash).call({
      from: web3js.eth.accounts.wallet[0].address
    })
    this.setState({
      totalDonations: totalDonations
    })
  }

  render() {
    return (
      <div>
        <h1>Tab2</h1>
        <p>{this.props.shortUrl}</p>
        <p>Total donations: {this.state.totalDonations}</p>
        <FormDonate shortUrl={this.props.shortUrl} />
      </div>
    );
  }
}
