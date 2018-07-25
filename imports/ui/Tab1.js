/*global browser*/
import React, { Component } from 'react'
import Web3Context from './Web3Context'
import ViewsTableFancy from './ViewsTableFancy'
import ModalButton from './ModalButton'
import AddFunds from './AddFunds'
import Settings from '../api/Settings.js'
import { withTracker } from 'meteor/react-meteor-data'
import classNames from 'classnames'
import TextField from '@material-ui/core/TextField'
import { withStyles } from '@material-ui/core/styles'
import InputAdornment from '@material-ui/core/InputAdornment'
import Paper from '@material-ui/core/Paper'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import Tooltip from '@material-ui/core/Tooltip';
import Switch from '@material-ui/core/Switch';

const styles = theme => ({
  root: {
    width: '100%',
    paddingLeft: theme.spacing.unit,
    paddingRight: theme.spacing.unit,
    paddingBottom: theme.spacing.unit,
    overflow: 'hidden',
  },
  paper: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: theme.spacing.unit * 2,
    padding: theme.spacing.unit * 2,
  },
  autoContributeSetting: {
    marginTop: theme.spacing.unit * 2,
    width: '100%',
    paddingLeft: theme.spacing.unit * 1,
    paddingRight: 0,/*'2px'*/
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowBottom: {
    justifyContent: 'space-between',
    marginTop: theme.spacing.unit *2,
  },
  switch: {
    height: '20px'
  },
  switchBase: {
    height: '20px'
  },
  dateField: {
    flexGrow: 1,
    flexBasis: 0,
  },
  budgetField: {
    marginLeft: theme.spacing.unit * 2,
    flexGrow: 1,
    flexBasis: 0,
    marginTop: 0,
    marginBottom: 0,
  },
  balance: {
    display: 'flex',
    alignItems: 'baseline'
  },
  addFundsButton: {
  },
})

const tracker = () => {
  return {
    settings: Settings.findOne(),
  }
}

const currencySymbols = {
  "USD": "$",
  "EUR": "€",
  "GBP": "£",
  "JPY": "¥",
  "CAD": "$",
}

class Tab1 extends Component {
  constructor(props) {
    super(props)
    this.state = {
      budget: 5,
      budgetCurrency: "USD",
      nextPayout: "",
      lastPayout: "",
      autoContributeEnabled: false,
    }

    this.handleChange = this.handleChange.bind(this)
  }

  handleChange(event) {
    switch (event.target.id) {
      case "budget":
        Settings.update({}, {$set: {"budget": event.target.value}})
        break
      case "nextPayout":
        let dateParts = event.target.value.split("-")
        let date = new Date(parseInt(dateParts[0]), parseInt(dateParts[1])-1, parseInt(dateParts[2]))
        if (date >= Date.now())
          Settings.update({}, {$set: {"nextPayout": date}})
        break
    }
    //this.setState({ [event.target.id]: event.target.value })
  }

  handleChangeSwitch = name => event => {
    this.setState({ [name]: event.target.checked })
  }

  formatDate(dateValue) {
    let date = new Date(dateValue)
    let year = date.getFullYear().toString()
    let month = date.getMonth() + 1
    if (month < 10) month = "0" + month.toString()
    else month = month.toString()
    let day = date.getDate()
    if (day < 10) day = "0" + day.toString()
    else day = day.toString()

    return year + "-" + month + "-" + day
  }

  render() {
    const { settings, classes } = this.props

    return (
      <div className={classes.root}>
        <div className={classes.autoContributeSetting}>
          <Typography variant="subheading">
            {/*Budget auto-payouts to visited sites*/}
            {/*Auto-contribute to visited sites*/}
            Compensate sites for ads blocked
          </Typography>
            {settings ? <Switch
              className={classes.switch}
              classes={{switchBase: classes.switchBase}}
              checked={this.state.autoContributeEnabled}
              onChange={this.handleChangeSwitch('autoContributeEnabled')}
            /> : ''}
        </div>
        <Paper className={classes.paper}>
          <div className={classes.row}>
            {settings ? <TextField
              id="nextPayout"
              label="Next payout"
              onChange={this.handleChange}
              type="date"
              value={this.formatDate(settings.nextPayout)}
              className={classes.dateField}
              InputLabelProps={{
                shrink: true,
              }}
            /> : ''}
            {settings ? <TextField
              id="budget"
              label="Auto-contribute"
              value={settings.budget}
              onChange={this.handleChange}
              disabled={!this.state.autoContributeEnabled}
              type="number"
              className={classes.budgetField}
              InputLabelProps={{
                shrink: true,
              }}
              InputProps={{
                startAdornment: <InputAdornment position="start">{currencySymbols[settings.budgetCurrency]}</InputAdornment>,
                endAdornment: <InputAdornment position="end">/Mo</InputAdornment>,
              }}
              margin="normal"
            /> : ''}
          </div>
          <div className={[classes.row, classes.rowBottom].join(' ')}>
            {settings ? <Web3Context.Consumer>
              { ({ cache  }) => { return (
                <div className={classes.balance}>
                  <Typography className={classes.balance} variant="title">
                    {"$" + (cache.fiatPerEth[settings.budgetCurrency] * cache.account.balances.ETH).toFixed(2)}
                  </Typography>
                  <Typography className={classes.balance} variant="body1">
                    {' (' + (cache.account.balances.ETH*100).toFixed(0) + 'mETH)'}
                  </Typography>
                </div>
              )}}
            </Web3Context.Consumer> : ''}
            <ModalButton className={classes.addFundsButton} text="Add Funds" variant="contained" color="secondary">
              <AddFunds />
            </ModalButton>
          </div>
        </Paper>
        <ViewsTableFancy />
      </div>
    )
  }
}

export default withTracker(tracker)( withStyles(styles)(Tab1) )
