import React from 'react'
import { makeStyles } from '@material-ui/styles'
import Paper from '@material-ui/core/Paper'
import Button from '@material-ui/core/Button'
import Tooltip from '@material-ui/core/Tooltip'
import TextField from '@material-ui/core/TextField'
import InputAdornment from '@material-ui/core/InputAdornment'

const useStyles = makeStyles(theme => ({
  paper: {
    paddingTop: theme.spacing(2),
    paddingRight: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    paddingLeft: theme.spacing(2),
  },
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  textField: {
    width: theme.spacing(16)
  }
}));

function InputAmount(props) {
  const {
    amount,
    currencySymbol,
    onChange,
    onClick,
    buttonText,
    buttonDisabled,
    tooltip
  } = props
  const classes = useStyles()

  return (
    <Paper className={classes.paper}>
      <div className={classes.container}>
        <TextField
          className={classes.textField}
          label="amount"
          onChange={onChange}
          value={amount}
          InputProps={{
            startAdornment: <InputAdornment position="start">{currencySymbol}</InputAdornment>,
            type: "number",
            step: ".01"
          }}
        />
        <Tooltip title={tooltip} enterDelay={300}>
          <div>
            <Button
              onClick={onClick}
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

export default InputAmount;
