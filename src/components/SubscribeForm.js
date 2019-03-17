import React, { Component } from 'react'
import strings from '../api/strings'
import { withStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import Button from '@material-ui/core/Button'
import Tooltip from '@material-ui/core/Tooltip'
import TextField from '@material-ui/core/TextField'
import InputAdornment from '@material-ui/core/InputAdornment'
import classNames from 'classnames'
import { connect } from 'react-redux'
import { addSubscription, removeSubscription, setTabIndex } from '../actions'
import { convertToUSD } from '../api/ECBForexRates'

function SubscribeForm({ subscription, subscribed, subscribedAmount, currency, onSubscribe, onUnsubscribe, classes }) {
  const currencySymbol = strings.currency[currency]

  const [amount, setAmount] = React.useState('')
  const [expanded, setExpanded] = React.useState(false)
  const [inputError, setInputError] = React.useState(false)
  const disabled = subscription.hostname === ''

  React.useEffect(reset, [subscription])

  function reset() {
    setAmount('')
    setExpanded(false)
    setInputError(false)
  }

  function handleClickSubscribe() {
    if (subscribed) {
      onUnsubscribe(subscription.hostname)
    }
    else if (!expanded) {
      setExpanded(true)
    }
    else if (amount === '') {
      setInputError(true)
    }
    else {
      onSubscribe({
        hostname: subscription.hostname,
        amount: convertToUSD(currency, Number(amount))
      })
      reset()
    }
  }

  return (
    <div className={classes.container} >
      <Paper
        className={expanded ? classNames(classes.paper, classes.paperExpanded) : classes.paper}
        elevation={expanded ? 2 : 0}
      >
        {expanded && <TextField
          label="monthly amount"
          className={classes.textField}
          onChange={event => setAmount(event.target.value)}
          error={inputError}
          InputProps={{
            startAdornment: <InputAdornment position="start">{currencySymbol}</InputAdornment>,
            type: "number",
            step: ".000000000000000001"
          }}
        />}
        <div className={classes.buttonSubscribe}>
          <Tooltip title={subscribed ? "stop giving "+currencySymbol+subscribedAmount.toString()+" every month" : ""}>
            <div>
              <Button
                onClick={handleClickSubscribe}
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
}

const styles = theme => ({
  buttonSubscribe: {
    alignSelf: 'flex-end'
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
    padding: theme.spacing.unit * 2,
    justifyContent: 'space-around',
  },
  textField: {
    marginRight: theme.spacing.unit * 2,
  }
})
SubscribeForm = withStyles(styles)(SubscribeForm);

function getSubscribedAmount(subscriptions, subscription) {
  let index = subscriptions.findIndex(sub => sub.hostname === subscription.hostname)
  if (index > -1)
    return subscriptions[index].amount
  return 0
}
const mapStateToProps = (state, ownProps) => ({
  subscribed: -1 !== state.subscriptions.findIndex(sub => sub.hostname === ownProps.subscription.hostname),
  subscribedAmount: getSubscribedAmount(state.subscriptions, ownProps.subscription),
  currency: state.settings.currency,
})
const mapDispatchToProps = dispatch => ({
  onSubscribe: sub => {
    dispatch(addSubscription(sub))
    .then(() => dispatch(setTabIndex(1)))
  },
  onUnsubscribe: hostname => dispatch(removeSubscription(hostname)),
})
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SubscribeForm)
