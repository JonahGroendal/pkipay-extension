import React, { Component } from 'react'
import Web3Context from './Web3Context'
import Typography from '@material-ui/core/Typography'
import { withStyles } from '@material-ui/core/styles'

const styles = theme => ({
  publicKey: {
    overflow: 'auto'
  }
})

class AddFunds extends Component {
  render() {
    const { classes } = this.props
    return (
      <Web3Context.Consumer>
        {value => { return (
          <div>
            <Typography variant="title">
              Send ETH to:
            </Typography>
            <Typography variant="subheading" className={classes.publicKey}>
               {value.web3js.eth.accounts.wallet[0].address}
            </Typography>
          </div>
        )}}
      </Web3Context.Consumer>
    )
  }
}

export default withStyles(styles)(AddFunds)
