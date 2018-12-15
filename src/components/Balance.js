import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import blockchain from '../api/blockchain'
import AddFunds from './AddFunds'
import ModalButton from './ModalButton'
import strings from '../api/strings'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import Tooltip from '@material-ui/core/Tooltip'
import convert from '../api/ECBForexRates.js';
import { connect } from 'react-redux';

function Balance({ currency, classes }) {

  const balance = useBalance(currency);

  const currencySymbol = strings.currency[currency];
  return (
    <Paper className={classes.paper}>
      <div className={classes.row}>
        <div className={classes.balance}>
          <Typography className={classes.balance} variant="title">
            {balance === null ? "Loading..." : currencySymbol + balance.toFixed(2)}
          </Typography>
        </div>
        <ModalButton className={classes.addFundsButton} text="Add Funds" variant="outlined" color="secondary">
          <AddFunds />
        </ModalButton>
      </div>
    </Paper>
  )
}

function useBalance(currency) {
  const [balance, setBalance] = React.useState(null);

  async function handleChange(newDaiBalance) {
    convert("USD", currency, parseFloat(newDaiBalance)/(10**18))
    .then(setBalance);
  }
  // Fetch initial balance
  React.useEffect(async () => {
    blockchain.getDaiBalance().then(handleChange);
  }, []);
  // Fetch balance whenever it changes
  React.useEffect(() => {
    return blockchain.subscribeToDaiTransfer(handleChange);
  });

  return balance;
}

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
Balance = withStyles(styles)(Balance)

const mapStateToProps = state => ({
  currency: state.settings.currency
})
export default connect(mapStateToProps)(Balance)
