import React, { Component } from 'react'
import { withStyles } from '@material-ui/core/styles'
import AddFunds from './AddFunds'
import Web3Context from './Web3Context'
import ModalButton from './ModalButton'
import strings from './api/strings'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import Tooltip from '@material-ui/core/Tooltip'
import BrowserStorageContext from './BrowserStorageContext'

const styles = theme => ({
  paper: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    width: '100%',
    padding: theme.spacing.unit * 2,
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  balance: {
    display: 'flex',
    alignItems: 'baseline'
  },
  addFundsButton: {

  },
})

function Balance(props) {
  const { classes } = props
  return (
    <BrowserStorageContext.Consumer>
      {storage => {
        if (!storage.state) return
        const settings = storage.state.settings
        return (
          <Paper className={classes.paper}>
            <div className={classes.row}>
              <Web3Context.Consumer>
                {cache => { return (
                  <div className={classes.balance}>
                    <Typography className={classes.balance} variant="title">
                      {strings.currency[settings.currency] + (cache.fiatPerEth[settings.currency] * cache.subject.balances.ETH).toFixed(2)}
                    </Typography>
                    <Typography className={classes.balance} variant="body1">
                      {' (' + (cache.subject.balances.ETH*100).toFixed(0) + 'mETH)'}
                    </Typography>
                  </div>
                )}}
              </Web3Context.Consumer>
              <ModalButton className={classes.addFundsButton} text="Add Funds" variant="outlined" color="secondary">
                <AddFunds />
              </ModalButton>
            </div>
          </Paper>
        )
      }}
    </BrowserStorageContext.Consumer>
  )
}

export default withStyles(styles)(Balance)
