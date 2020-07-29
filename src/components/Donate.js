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
  container: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between'
  },
  inputContainer: {
    display: 'flex',
    alignItems: 'flex-end'
  },
  textField: {
    width: theme.spacing(8)
  },
  selectField: {
    marginLeft: theme.spacing(1),
    minWidth: theme.spacing(7)
  },
  scheduleField: {
    marginLeft: theme.spacing(1),
    width: theme.spacing(10) + 4
  },
  buttonProgress: {
    position: 'absolute',
  }
}));

function Donate(props) {
  const {
    amount,
    onChangeAmount,
    error,
    token,
    schedule,
    tokenOptions,
    scheduleOptions,
    onChangeToken,
    onChangeSchedule,
    onClickButton,
    buttonText,
    buttonDisabled,
    buttonLoading,
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
            error={error}
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
          <TextField
            className={classes.scheduleField}
            select
            value={schedule}
            onChange={event => onChangeSchedule(event.target.value)}
          >
            {scheduleOptions.map((val, i) => (
              <MenuItem key={i} value={val}>
                {val}
              </MenuItem>
            ))}
          </TextField>
        </div>
        <Tooltip title={tooltip} enterDelay={300}>
          <div className={classes.button}>
            <Button
              onClick={onClickButton}
              disabled={buttonDisabled || buttonLoading}
              variant="contained" size="medium" color="primary"
            >
              {buttonText}
              {buttonLoading && <CircularProgress size={24} className={classes.buttonProgress}/>}
            </Button>
          </div>
        </Tooltip>
      </div>
    </Paper>
  )
}

export default Donate;
