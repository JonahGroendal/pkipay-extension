import React from 'react'
import { makeStyles } from '@material-ui/styles'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import Tooltip from '@material-ui/core/Tooltip'
import TextField from '@material-ui/core/TextField'
import InputAdornment from '@material-ui/core/InputAdornment'
import MenuItem from '@material-ui/core/MenuItem'
import CircularProgress from '@material-ui/core/CircularProgress'

const useStyles = makeStyles(theme => ({
    paper: {
      paddingTop: theme.spacing(2),
      paddingRight: theme.spacing(2),
      paddingBottom: theme.spacing(2),
      paddingLeft: theme.spacing(2),
    },
    details: {
      paddingTop: theme.spacing(1)
    },
    rowContainer: {
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'space-between'
    },
    inputContainer: {
      display: 'flex',
      alignItems: 'flex-end'
    },
    selectField: {
      marginLeft: theme.spacing(1)
    },
    textField: {
      width: theme.spacing(14)
    },
    typeField: {
      width: theme.spacing(8)
    },
    submitOrderButton: {
      display: 'flex',
      justifyContent: 'flex-end',
      minWidth: theme.spacing(14)
    },
    buttonProgress: {
      position: 'absolute',
    },
}));


function Token(props) {
  const {
    adminViewEnabled,
    title,
    inputLabel,
    amount, onChangeAmount,
    orderTypeOptions, orderType, onChangeOrderType,
    submitOrderButtonText,
    submitOrderButtonTooltip,
    submitOrderButtonDisabled,
    submitOrderButtonLoading,
    onClickSubmitOrder,
    subtitle,
    totalSupplyText,
    totalReservesText,
    priceText,
    withdrawAmount,
    onChangeWithdrawAmount,
    tokenOptions,
    token,
    onChangeToken,
    onClickWithdraw,
    withdrawButtonDisabled
  } = props;
  const classes = useStyles();


  return (
    <Paper className={classes.paper}>
      <Typography variant="h6">
        {title}
      </Typography>
      <Typography variant="body2">
        {subtitle}
      </Typography>
      <div className={classes.details}>
        <Typography>
          {totalSupplyText.concat(" coins in circulation")}
        </Typography>
        <Typography>
          {totalReservesText.concat(" held in reserve")}
        </Typography>
        <Typography>
          {"Price: ".concat(priceText)}
        </Typography>
      </div>
      {!adminViewEnabled && <div className={classes.rowContainer}>
        <TextField
          className={classes.typeField}
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
        <TextField
          className={classes.textField}
          label={inputLabel}
          onChange={event => onChangeAmount(event.target.value)}
          value={amount}
          InputProps={{
            endAdornment: <InputAdornment position="end">tokens</InputAdornment>,
          }}
        />
        <Tooltip title={submitOrderButtonTooltip} enterDelay={300}>
          <div className={classes.submitOrderButton}>
            <Button
              onClick={onClickSubmitOrder}
              disabled={submitOrderButtonDisabled || submitOrderButtonLoading}
              variant="contained" size="medium" color="secondary"
            >
              {submitOrderButtonText}
              {submitOrderButtonLoading && <CircularProgress size={24} className={classes.buttonProgress}/>}
            </Button>
          </div>
        </Tooltip>
      </div>}
      {adminViewEnabled && <div className={classes.rowContainer}>
        <div className={classes.inputContainer}>
          <TextField
            className={classes.textField}
            label={"Amount"}
            onChange={event => onChangeWithdrawAmount(event.target.value)}
            value={withdrawAmount}
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
        <Tooltip title={"Withdraw reserves"} enterDelay={300}>
          <div className={classes.button}>
            <Button
              onClick={onClickWithdraw}
              disabled={withdrawButtonDisabled}
              variant="contained" size="medium" color="secondary"
            >
              {"Withdraw"}
            </Button>
          </div>
        </Tooltip>
      </div>}
    </Paper>
  )
}

export default Token
