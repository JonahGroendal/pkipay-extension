import web3js from './api/web3js'
import { donate } from './api/contractGratis'
import React, { Component } from 'react'
import namehash from 'eth-ens-namehash'
import TextField from '@material-ui/core/TextField'
import InputAdornment from '@material-ui/core/InputAdornment'
import Button from '@material-ui/core/Button'


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
  handleSubmit(event) {
    event.preventDefault()

    //console.log(value)

    let recipient = namehash.hash(this.props.shortUrl)
    let amount = web3js.utils.toWei(this.state.value, 'ether')

    donate(recipient, amount)
    .then(success => {
      console.log("Success: " + JSON.stringify(success))
    })
    .catch(error => {
      console.log("Error: " + JSON.stringify(error))
    })
  }

  render() {
    return (
      <div>
        {/*<form onSubmit={event => this.handleSubmit(event, value.web3js, value.contractGratis)}>
          Donate ETH:
          <input
            type="number"
            step=".000000000000000001"
            value={this.state.value}
            onChange={this.handleChange}
          />
          <input type="submit" />
        </form>*/}

        <TextField
          label="monthly amount"
          onChange={this.handleChange}
          InputProps={{
            startAdornment: <InputAdornment position="start">Kg</InputAdornment>,
            type: "number",
            step: ".000000000000000001"
          }}
        />
        <Button variant="outlined" onClick={this.handleSubmit}>
          Submit
        </Button>
      </div>
    )
  }
}
