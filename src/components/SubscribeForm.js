import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import Button from '@material-ui/core/Button'
import Tooltip from '@material-ui/core/Tooltip'
import TextField from '@material-ui/core/TextField'
import InputAdornment from '@material-ui/core/InputAdornment'
import classNames from 'classnames'

const SubscribeForm = ({ classes, subscribed, expanded, disabled, subscribedAmount, currencySymbol, inputError, onChangeAmount, onClickSubscribe }) => (
  <div className={classes.container} >
    <Paper
      className={expanded ? classNames(classes.paper, classes.paperExpanded) : classes.paper}
      elevation={expanded ? 2 : 0}
    >
      {expanded && <TextField
        label="monthly amount"
        className={classes.textField}
        autoFocus={true}
        onChange={event => onChangeAmount(event.target.value)}
        onKeyPress={event => {
          if (event.key === 'Enter') {
            onClickSubscribe();
            event.preventDefault();
          }
        }}
        error={inputError}
        InputProps={{
          startAdornment: <InputAdornment position="start">{currencySymbol}</InputAdornment>,
          type: "number",
          step: ".000000000000000001"
        }}
      />}
      <div className={classes.button}>
        <Tooltip title={subscribed ? "stop giving "+currencySymbol+subscribedAmount.toString()+" every month" : ""} enterDelay={500}>
          <div>
            <Button
              onClick={onClickSubscribe}
              variant={(expanded || subscribed) ? "outlined" : "contained"}
              size="medium"
              color="secondary"
              elevation={expanded ? 0 : 1}
              disabled={disabled}
            >
              {subscribed ? "Unsubscribe" : "Subscribe"}
            </Button>
          </div>
        </Tooltip>
      </div>
    </Paper>
  </div>
)

const styles = theme => ({
  button: {
    alignSelf: 'flex-end',
  },
  container: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  paper: {
    width: '126.5px',
    display: 'flex',
    justifyContent: 'flex-end',
    transitionProperty: 'width height',
    transitionDuration: '300ms',
    transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  paperExpanded: {
    width: '100%',
    padding: theme.spacing(2),
    justifyContent: 'space-around',
  },
  textField: {
    marginRight: theme.spacing(2),
  }
})

export default withStyles(styles)(SubscribeForm)
