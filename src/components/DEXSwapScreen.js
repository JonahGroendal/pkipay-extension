import React from 'react'
import { makeStyles } from '@material-ui/styles'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import FullScreenDialog from './FullScreenDialog'
import TextField from '@material-ui/core/TextField'
import MenuItem from '@material-ui/core/MenuItem'

const useStyles = makeStyles(theme => ({
  root: {
    marginTop: theme.spacing(2),
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2)
  },
  inputRow: {
    marginTop: theme.spacing(1)
  },
  orderTypeField: {
    width: theme.spacing(16)
  },
  typeField: {
    width: theme.spacing(14),
    marginLeft: theme.spacing(2)
  },
  amountField: {
    width: theme.spacing(20)
  },
  forAmountContainer: {
    marginTop: theme.spacing(2)
  },
  detailsContainer: {
    marginTop: theme.spacing(2)
  },
  buttonContainer: {
    marginTop: theme.spacing(2)
  },
  button: {
    marginTop: theme.spacing(2)
  },
  errorMessage: {
    color: theme.palette.error.main
  }
}));

export default function DEXSwapScreen(props) {
  const {
    open,
    onClose,
    onClick,
    orderType,
    onChangeOrderType,
    orderTypeOptions,
    amount,
    onChangeAmount,
    amountError,
    dexError,
    submitButtonDisabled,
    token,
    onChangeToken,
    tokenOptions,
    forAmount,
    price,
    protocolFee
  } = props
  const classes = useStyles();

  return (
    <FullScreenDialog
      title={`Exchange ETH for DAI`}
      open={open}
      onClose={onClose}
    >
      <div className={classes.root}>
        <div className={classes.inputRow}>
          <TextField
            className={classes.orderTypeField}
            label={'Order Type'}
            select
            value={orderType}
            onChange={event => onChangeOrderType(event.target.value)}
          >
            {orderTypeOptions.map((value, i) => (
              <MenuItem key={i} value={value}>
                {value}
              </MenuItem>
            ))}
          </TextField>
        </div>
        <div className={classes.inputRow}>
          <TextField
            className={classes.amountField}
            error={amountError}
            label={'Amount'}
            onChange={event => onChangeAmount(event.target.value)}
            value={amount}
          />
          <TextField
            className={classes.typeField}
            label={'Currency'}
            select
            value={token}
            onChange={event => onChangeToken(event.target.value)}
          >
            {tokenOptions.map((value, i) => (
              <MenuItem key={i} value={value}>
                {value}
              </MenuItem>
            ))}
          </TextField>
        </div>
        <div className={classes.forAmountContainer}>
          <Typography variant="h5">
            {`for ${forAmount}`}
          </Typography>
        </div>
        <div className={classes.detailsContainer}>
          <Typography>
            {`Price: ${price}`}
          </Typography>
          <Typography>
            {`Exchange Fee: ${protocolFee}`}
          </Typography>
          {/*<Typography>
            {`Total: ${total}`}
          </Typography>*/}
        </div>
        <div className={classes.buttonContainer}>
          <Button
            className={classes.button}
            onClick={onClick}
            disabled={submitButtonDisabled}
            variant="contained" size="medium" color="primary"
          >
            {'Submit Order'}
          </Button>
        </div>
        {!!dexError && (
          <Typography className={classes.errorMessage}>
            {`0x Error: ${dexError}`}
          </Typography>
        )}
      </div>
    </FullScreenDialog>
  )
}
