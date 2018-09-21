import web3js from './api/web3js'
import React, { Component } from 'react'
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
      <div>
        <Typography variant="title">
          Send ETH to:
        </Typography>
        <Typography variant="subheading" className={classes.publicKey}>
           {web3js.eth.accounts.wallet[0].address}
        </Typography>
      </div>
    )
  }
}

export default withStyles(styles)(AddFunds)
