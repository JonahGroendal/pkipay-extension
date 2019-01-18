import React, { Component } from 'react'
import strings from '../api/strings'
import web3js from '../api/web3js'
import namehash from 'eth-ens-namehash'
import { withStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import Tooltip from '@material-ui/core/Tooltip'
import Collapse from '@material-ui/core/Collapse'
import TextField from '@material-ui/core/TextField'
import InputAdornment from '@material-ui/core/InputAdornment'
import classNames from 'classnames'
import { connect } from 'react-redux'
import { addSubscription, removeSubscription, rescheduleSubscriptionsPayments, unlockWalletRequest } from '../actions'

class FormSubscribe extends Component {
  constructor(props) {
    super(props)
    this.state = this.initialState(props)
  }

  initialState = props => ({
      amount: '',
      expanded: false,
      subscribeButtonShown: true,
      donateButtonShown: false,
      inputError: false
  })

  componentDidUpdate(prevProps, prevState, snapshot) {
    // Reset if target changed
    if (prevProps.subscription.hostname !== this.props.subscription.hostname)
      this.setState(this.initialState(this.props))
  }

  handleClickSubscribe = () => {
    if (this.props.subscribed) {
      this.props.onUnsubscribe(this.props.subscription.hostname);
    }
    else if (!this.state.expanded) {
      this.setState({ expanded: true, donateButtonShown: false})
    }
    else if (this.state.amount === '') {
      this.setState({ inputError: true })
    }
    else {
      const sub = { hostname: this.props.subscription.hostname, amount: Number(this.state.amount) }
      this.props.onSubscribe(sub)
      this.setState({ expanded: false, inputError: false, amount: '' })
    }
  }

  handleClickDonate = () => {
    if (!this.state.expanded) {
      this.setState({ expanded: true, subscribeButtonShown: false })
    }
    else {
      this.donate()
    }
  }

  handleChange = stateVarName => (event) => {
    this.setState({[stateVarName]: event.target.value})
  }

  handleToggle = stateVarName => () => {
    this.setState({
      [stateVarName]: !this.state[stateVarName]
    })
  }

  render() {
    const { amount, expanded, subscribeButtonShown, donateButtonShown, inputError } = this.state
    const { subscription, subscribed, subscribedAmount, currency, classes } = this.props

    const currencySymbol = strings.currency[currency]

    return (
      <div className={classes.container} >
        <Paper
          className={expanded ? classNames(classes.paper, classes.paperExpanded) : classes.paper}
          elevation={expanded ? 2 : 0}
        >
          {expanded && subscribeButtonShown && <TextField
            label="monthly amount"
            className={classes.textField}
            onChange={this.handleChange('amount')}
            error={inputError}
            InputProps={{
              startAdornment: <InputAdornment position="start">{currencySymbol}</InputAdornment>,
              type: "number",
              step: ".000000000000000001"
            }}
          />}
          {expanded && donateButtonShown && <TextField
            label="one-time amount"
            className={classes.textField}
            onChange={this.handleChange('amount')}
            error={inputError}
            InputProps={{
              startAdornment: <InputAdornment position="start">{currencySymbol}</InputAdornment>,
              type: "number",
              step: ".000000000000000001"
            }}
          />}
          {subscribeButtonShown && <div className={classes.buttonSubscribe}>
            <Tooltip title={subscribed ? "stop giving "+currencySymbol+subscribedAmount.toString()+" every month" : ""}>
              <Button
                onClick={this.handleClickSubscribe}
                variant={(expanded || subscribed) ? "outlined" : "contained"}
                size="medium"
                color="secondary"
                elevation={expanded ? 0 : 1}
              >
                {subscribed ? "Unsubscribe" : "Subscribe"}
              </Button>
            </Tooltip>
          </div>}
          {donateButtonShown && <div className={classes.buttonDonate}>
            <Button
              onClick={this.handleClickDonate}
              variant={expanded ? "outlined" : "contained"}
              size="medium"
              color="secondary"
              elevation={0}
            >
              Donate
            </Button>
          </div>}
        </Paper>
      </div>
    )
  }
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
FormSubscribe = withStyles(styles)(FormSubscribe);

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
    if (web3js.eth.accounts.wallet.length > 0)
      dispatch(rescheduleSubscriptionsPayments())
    else
      dispatch(unlockWalletRequest()).then(() => dispatch(rescheduleSubscriptionsPayments()))
  },
  onUnsubscribe: hostname => dispatch(removeSubscription(hostname)),
})
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(FormSubscribe)
