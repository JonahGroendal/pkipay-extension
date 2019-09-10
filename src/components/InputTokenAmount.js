import React from 'react'
import { makeStyles } from '@material-ui/styles'
import Paper from '@material-ui/core/Paper'
import Button from '@material-ui/core/Button'
import Tooltip from '@material-ui/core/Tooltip'
import TextField from '@material-ui/core/TextField'
import InputAdornment from '@material-ui/core/InputAdornment'
import MenuItem from '@material-ui/core/MenuItem'

const useStyles = makeStyles(theme => ({
  paper: {
    paddingTop: theme.spacing(2),
    paddingRight: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    paddingLeft: theme.spacing(2),
  },
  container: {
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
  }
}));

function InputTokenAmount(props) {
  const {
    amount,
    onChangeAmount,
    token,
    tokenOptions,
    onChangeToken,
    onClickButton,
    buttonText,
    buttonDisabled,
    tooltip
  } = props
  const classes = useStyles()

  return (
    <Paper className={classes.paper}>
      <div className={classes.container}>
        <div className={classes.inputContainer}>
          <TextField
            className={classes.textField}
            label={"Amount"}
            onChange={event => onChangeAmount(event.target.value)}
            value={amount}
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
        <Tooltip title={tooltip} enterDelay={300}>
          <div className={classes.button}>
            <Button
              onClick={onClickButton}
              disabled={buttonDisabled}
              variant="contained" size="medium" color="secondary"
            >
              {buttonText}
            </Button>
          </div>
        </Tooltip>
      </div>
    </Paper>
  )
}

export default InputTokenAmount;
