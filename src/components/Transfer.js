import React from 'react'
import { makeStyles } from '@material-ui/styles'
import Paper from '@material-ui/core/Paper'
import Button from '@material-ui/core/Button'
import CircularProgress from '@material-ui/core/CircularProgress'
import Tooltip from '@material-ui/core/Tooltip'
import TextField from '@material-ui/core/TextField'
import MenuItem from '@material-ui/core/MenuItem'

const useStyles = makeStyles(theme => ({
  paper: {
    paddingTop: theme.spacing(2),
    paddingRight: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    paddingLeft: theme.spacing(2),
  },
  inputRow: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(2)
  },
  buttonRow: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
  addressField: {
    width: '100%'
  },
  amountField: {
    width: '100%'
  },
  selectField: {
    marginLeft: theme.spacing(3),
    minWidth: theme.spacing(12)
  }
}));

function Transfer(props) {
  const {
    toAddress,
    amount,
    onChangeToAddress,
    onChangeAmount,
    toAddressError,
    amountError,
    token,
    tokenOptions,
    onChangeToken,
    onClickButton,
    buttonText,
    tooltip
  } = props
  const classes = useStyles()

  return (
    <Paper className={classes.paper}>
      <div className={classes.inputRow}>
        <TextField
          className={classes.addressField}
          label={"To"}
          onChange={event => onChangeToAddress(event.target.value)}
          value={toAddress}
          error={toAddressError}
        />
      </div>
      <div className={classes.inputRow}>
        <TextField
          className={classes.amountField}
          label={"Amount"}
          onChange={event => onChangeAmount(event.target.value)}
          value={amount}
          error={amountError}
        />
        <TextField
          className={classes.selectField}
          select
          value={token}
          onChange={event => onChangeToken(event.target.value)}
        >
          {tokenOptions.map((symbol, i) => (
            <MenuItem key={i} value={symbol}>
              {symbol}
            </MenuItem>
          ))}
        </TextField>
      </div>
      <div className={classes.buttonRow}>
        <Tooltip title={tooltip} enterDelay={300}>
          <div className={classes.button}>
            <Button
              onClick={onClickButton}
              variant="contained" size="medium" color="primary"
            >
              {buttonText}
            </Button>
          </div>
        </Tooltip>
      </div>
    </Paper>
  )
}

export default Transfer;
