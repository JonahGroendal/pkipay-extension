import React, { Component } from 'react'
import strings from './api/strings'
import Web3Context from './Web3Context'
import BrowserStorageContext from './BrowserStorageContext'
import namehash from 'eth-ens-namehash'
import { withStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import Collapse from '@material-ui/core/Collapse'
import TextField from '@material-ui/core/TextField'
import InputAdornment from '@material-ui/core/InputAdornment'
import classNames from 'classnames'


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

class FormSubscribe extends Component {
  constructor(props) {
    super(props)
    this.state = this.initialState(props)
  }

  initialState = props => {
    return ({
      subscribed: props.browserStorage.state ? this.checkSubscribed() : false,
      amount: '',
      expanded: false,
      subscribeButtonShown: true,
      donateButtonShown: false,
      inputError: false
    })
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    // Reset if target changed
    if (prevProps.hostname !== this.props.hostname)
      this.setState(this.initialState(this.props))

    // check if subscription status changed
    if (!this.props.browserStorage.state) return;
    const subscribed = this.checkSubscribed()
    if (subscribed != this.state.subscribed)
      this.setState({ subscribed: subscribed })
  }

  handleClickSubscribe = () => {
    if (this.state.subscribed) {
      this.unsubscribe()
    }
    else if (!this.state.expanded) {
      this.setState({ expanded: true, donateButtonShown: false})
    }
    else if (this.state.amount === '') {
      this.setState({ inputError: true })
    }
    else {
      this.subscribe()
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

  donate = () => {
    // From Web3Context.Consumer
    const { web3js, contractGratis } = this.props.web3
    const parts = this.props.hostname.split('.')
    const shortUrl = parts[parts.length-2]+'.'+parts[parts.length-1]

    let recipient = namehash.hash(shortUrl)
    let amount = web3js.utils.toWei(this.state.amount, 'ether')

    contractGratis.methods.donate(recipient).send({
      value: amount,
      from: web3js.eth.accounts.wallet[0].address,
      gas: 100000
    })
    .then(success => {
      console.log("Success: " + JSON.stringify(success))
    })
    .catch(error => {
      console.log("Error: " + JSON.stringify(error))
    })
  }

  subscribe = () => {
    const { hostname, browserStorage } = this.props
    const { amount } = this.state

    if (browserStorage.state && !this.checkSubscribed())
      browserStorage.appendToSubs(hostname, amount)
  }

  unsubscribe = () => {
    const { hostname, browserStorage } = this.props

    browserStorage.removeFromSubs(hostname)
  }

  checkSubscribed = () => {
    const { hostname, browserStorage } = this.props

    return (browserStorage.state.subs.findIndex(e => e.hostname == hostname) != -1)
  }

  render() {
    const { subscribed, amount, expanded, subscribeButtonShown, donateButtonShown, inputError } = this.state
    const { hostname, browserStorage, classes } = this.props

    if (!browserStorage.state) return ''
    const currencySymbol = strings.currency[browserStorage.state.settings.currency]
    const alreadySubscribed = browserStorage.state.subs.findIndex(e => e.hostname == hostname) != -1

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
            <Button
              onClick={this.handleClickSubscribe}
              variant={(expanded || subscribed) ? "outlined" : "contained"}
              size="medium"
              color="secondary"
              elevation={expanded ? 0 : 1}
            >
              {subscribed ? "Unsubscribe" : "Subscribe"}
            </Button>
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

FormSubscribe = withStyles(styles)(FormSubscribe)
export default (props) => (
  <Web3Context.Consumer>
    {web3 => <BrowserStorageContext.Consumer>
      {browserStorage => <FormSubscribe {...props} web3={web3} browserStorage={browserStorage} />}
    </BrowserStorageContext.Consumer>}
  </Web3Context.Consumer>
)
