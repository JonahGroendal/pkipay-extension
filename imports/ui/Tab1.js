/*global browser*/
import React, { Component } from 'react'
import Web3Context from './Web3Context'
import ViewsTableFancy from './ViewsTableFancy'
import ModalButton from './ModalButton'
import AddFunds from './AddFunds'
import Settings from '../api/Settings.js'
import { withTracker } from 'meteor/react-meteor-data'
import TextField from '@material-ui/core/TextField'
import { withStyles } from '@material-ui/core/styles'
import InputAdornment from '@material-ui/core/InputAdornment'
import Paper from '@material-ui/core/Paper'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'

const styles = theme => ({
  paper: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    width: '98%',
    marginTop: theme.spacing.unit * 2,
    marginLeft: '1%',
    marginRight: '1%',
    padding: theme.spacing.unit * 2,
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
  budgetField: {
    flexGrow: 1,
    flexBasis: 0,
    marginTop: 0,
    marginBottom: 0,
  },
  dateField: {
    marginLeft: theme.spacing.unit *2,
    flexGrow: 1,
    flexBasis: 0
  },
  balance: {
    display: 'flex',
  },
  addFundsButton: {
  }
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
      nextContribution: "",
      lastContribution: "",
    }

    this.handleChange = this.handleChange.bind(this)
  }

  handleChange(event) {
    switch (event.target.id) {
      case "budget":
        Settings.update({}, {$set: {"budget": event.target.value}})
        break
      case "nextContribution":
        let dateParts = event.target.value.split("-")
        console.log(dateParts)
        let date = new Date(parseInt(dateParts[0]), parseInt(dateParts[1])-1, parseInt(dateParts[2]))
        Settings.update({}, {$set: {"nextContribution": date}})
        break
    }
    //this.setState({ [event.target.id]: event.target.value })
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
      <React.Fragment>
        <Paper className={classes.paper}>
          <div className={classes.row}>
            {settings ? <TextField
              id="budget"
              label="Budget"
              value={settings.budget}
              onChange={this.handleChange}
              type="number"
              className={classes.budgetField}
              InputLabelProps={{
                shrink: true,
              }}
              InputProps={{
                startAdornment: <InputAdornment position="start">{currencySymbols[settings.budgetCurrency]}</InputAdornment>,
              }}
              margin="normal"
            /> : ''}
            {settings ? <TextField
              id="nextContribution"
              label="Next Contribution"
              onChange={this.handleChange}
              type="date"
              value={this.formatDate(settings.nextContribution)}
              className={classes.dateField}
              InputLabelProps={{
                shrink: true,
              }}
            /> : ''}
          </div>
          <div className={[classes.row, classes.rowBottom].join(' ')}>
            {settings ? <Web3Context.Consumer>
              { ({ cache  }) => { return (
                <div className={classes.balance}>
                  <Typography className={classes.balance} variant="title">
                    {"$" + (cache.fiatPerEth[settings.budgetCurrency]* cache.account.balances.ETH).toFixed(2)}
                  </Typography>
                  <Typography className={classes.balance} variant="subheading">
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
      </React.Fragment>
    )
  }
}

export default withTracker(tracker)( withStyles(styles)(Tab1) )
