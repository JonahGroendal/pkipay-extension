import strings from './api/strings'
import React, { Component } from 'react'
import Web3Context from './Web3Context'
import SubscriptionsTable from './SubscriptionsTable'
import ModalButton from './ModalButton'
import AddFunds from './AddFunds'
import classNames from 'classnames'
import TextField from '@material-ui/core/TextField'
import { withStyles } from '@material-ui/core/styles'
import InputAdornment from '@material-ui/core/InputAdornment'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import Tooltip from '@material-ui/core/Tooltip'
import Switch from '@material-ui/core/Switch'
import BrowserStorageContext from './BrowserStorageContext'

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
    justifyContent: 'space-between',
  },
  rowBottom: {
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

// const tracker = () => {
//   return {
//     settings: Settings.findOne(),
//   }
// }

class TabManage extends Component {
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
        //Settings.update({}, {$set: {"budget": event.target.value}})
        break
      case "nextPayout":
        let dateParts = event.target.value.split("-")
        let date = new Date(parseInt(dateParts[0]), parseInt(dateParts[1])-1, parseInt(dateParts[2]))
        if (date >= Date.now())
          //Settings.update({}, {$set: {"nextPayout": date}})
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
    const { classes, onViewProfile } = this.props

    return (
      <BrowserStorageContext.Consumer>
        {storage => {
          if (!storage.state) return ''
          const settings = storage.state.settings
          return (
            <div className={classes.root}>
              {/*<div className={classes.autoContributeSetting}>
                <Typography variant="subheading">
                  {/*Budget auto-payouts to visited sites*/}
                  {/*Auto-contribute to visited sites*/  /*}
                  Compensate sites for ads blocked
                </Typography>
                <Switch
                  className={classes.switch}
                  classes={{switchBase: classes.switchBase}}
                  checked={settings.autoContributeEnabled}
                  onChange={event => storage.handleChange('settings.autoContributeEnabled', event.target.checked)}
                />
              </div>*/}
              <Paper className={classes.paper}>
                {/*<div className={classes.row}>
                  <TextField
                    id="nextPayout"
                    label="Next payout"
                    onChange={event => storage.handleChange('settings.nextPayout', event.target.value)}
                    type="date"
                    value={this.formatDate(settings.nextPayout)}
                    className={classes.dateField}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                  <TextField
                    id="budget"
                    label="Auto-contribute"
                    value={settings.budget}
                    onChange={event => storage.handleChange('settings.budget', event.target.value)}
                    disabled={!settings.autoContributeEnabled}
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
                  />
                </div>*/}
                <div className={classes.row}>
                  <Web3Context.Consumer>
                    { ({ cache  }) => { return (
                      <div className={classes.balance}>
                        <Typography className={classes.balance} variant="title">
                          {strings.currency[settings.currency] + (cache.fiatPerEth[settings.currency] * cache.account.balances.ETH).toFixed(2)}
                        </Typography>
                        <Typography className={classes.balance} variant="body1">
                          {' (' + (cache.account.balances.ETH*100).toFixed(0) + 'mETH)'}
                        </Typography>
                      </div>
                    )}}
                  </Web3Context.Consumer>
                  <ModalButton className={classes.addFundsButton} text="Add Funds" variant="outlined" color="secondary">
                    <AddFunds />
                  </ModalButton>
                </div>
              </Paper>
              <SubscriptionsTable onViewProfile={onViewProfile}/>
            </div>
          )
        }}
      </BrowserStorageContext.Consumer>
    )
  }
}

//export default withTracker(tracker)( withStyles(styles)(TabManage) )
export default withStyles(styles)(TabManage)
