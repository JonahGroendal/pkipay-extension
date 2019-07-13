import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import AddFunds from './AddFunds'
import ModalButton from './ModalButton'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'

const Balance = ({ balance, currencySymbol, classes }) => (
  <Paper className={classes.paper}>
    <div className={classes.row}>
      <div className={classes.balance}>
        <Typography variant="h6" className={classes.balance}>
          {balance === null ? "Loading..." : currencySymbol + balance.toFixed(2)}
        </Typography>
      </div>
      <ModalButton
        className={classes.addFundsButton}
        text="Add Funds" variant="outlined" color="secondary"
      >
        <AddFunds />
      </ModalButton>
    </div>
  </Paper>
)

const styles = theme => ({
  paper: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    width: '100%',
    padding: theme.spacing(2),
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
  addFundsButton: {},
})

export default withStyles(styles)(Balance)
