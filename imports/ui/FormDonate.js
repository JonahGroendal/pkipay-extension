import React, { Component } from 'react'
import Web3Context from './Web3Context'
import namehash from 'eth-ens-namehash'

export default class FormDonate extends Component {
  constructor(props) {
    super(props)
    this.state = {
      value: ''
    }
    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  handleChange(event) {
    this.setState({value: event.target.value})
  }

  // Donate
  handleSubmit(event, value) {
    event.preventDefault()

    console.log(value)

    let recipient = namehash.hash(this.props.shortUrl)
    let amount = value.web3js.utils.toWei(this.state.value, 'ether')

    value.contractGratis.methods.donate(recipient).send({
      value: amount,
      from: value.web3js.eth.accounts.wallet[0].address,
      gas: 100000
    })
    .then(success => {
      console.log("Success: ")
      console.log(success)
    })
    .catch(error => {
      console.log("Error: ")
      console.log(error)
    })
  }

  render() {
    return (
      <Web3Context.Consumer>
        {val => { return (
          <form onSubmit={event => this.handleSubmit(event, val)}>
            Donate ETH:
            <input
              type="number"
              step=".000000000000000001"
              value={this.state.value}
              onChange={this.handleChange}
            />
            <input type="submit" />
          </form>
        )}}
      </Web3Context.Consumer>
    )
  }
}
