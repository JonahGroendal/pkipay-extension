import React from 'react'
import { makeStyles } from '@material-ui/styles'
import Paper from '@material-ui/core/Paper'
import Button from '@material-ui/core/Button'
import Tooltip from '@material-ui/core/Tooltip'
import TextField from '@material-ui/core/TextField'
import MenuItem from '@material-ui/core/MenuItem'
import Typography from '@material-ui/core/Typography'

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
    firstInputRef,
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
    tooltip
  } = props
  const classes = useStyles()

  return (
    <Paper className={classes.paper}>
      <Typography variant="h6">
        Transfer Tokens
      </Typography>
      <div className={classes.inputRow}>
        <TextField
          inputRef={firstInputRef}
          className={classes.addressField}
          label={"Recipient address"}
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
              Review
            </Button>
          </div>
        </Tooltip>
      </div>
    </Paper>
  )
}

export default Transfer;
