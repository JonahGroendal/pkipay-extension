import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { buyTHX } from '../api/blockchain';
import strings from '../api/strings'
import Paper from '@material-ui/core/Paper'
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import { connect } from 'react-redux'

function Donate({ subscription, currency, classes }) {
  const [amount, setAmount] = React.useState(2.0);

  const currencySymbol = strings.currency[currency];
  return (
    <Paper className={classes.paper}>
      <div className={classes.container}>
        <TextField
          className={classes.textField}
          label="amount"
          onChange={e => setAmount(e.target.value)}
          value={amount}
          InputProps={{
            startAdornment: <InputAdornment position="start">{currencySymbol}</InputAdornment>,
            type: "number",
            step: ".01"
          }}
        />
        <Button
          onClick={e => buyTHX(subscription.hostname, amount)}
          variant="outlined"
          size="medium"
          color="secondary"
        >
          Donate
        </Button>
      </div>
    </Paper>
  )
}

const styles = theme => ({
  paper: {
    paddingTop: theme.spacing.unit * 2,
    paddingRight: theme.spacing.unit * 2,
    paddingBottom: theme.spacing.unit * 2,
    paddingLeft: theme.spacing.unit * 2,
  },
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  textField: {
    width: theme.spacing.unit * 16
  },
})
Donate = withStyles(styles)(Donate);

const mapStateToProps = state => ({
  currency: state.settings.currency
})

export default connect(mapStateToProps)(Donate)
