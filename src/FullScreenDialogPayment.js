import React, { Component } from 'react'
import FullScreenDialog from './FullScreenDialog'
import BrowserStorageContext from './BrowserStorageContext'
import strings from './api/strings'
import { donate, donateToMany } from './api/contractGratis'
import { getViews, getSites } from './api/storageDb'
import { withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import IconButton from '@material-ui/core/IconButton'
import SettingsIcon from '@material-ui/icons/SettingsApplications'
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Switch from '@material-ui/core/Switch';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import WifiIcon from '@material-ui/icons/Wifi';
import ListSubheader from '@material-ui/core/ListSubheader';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

const styles = theme => ({
  contentRoot: {
    backgroundColor: theme.palette.background.default
  },
  subsList: {
    backgroundColor: theme.palette.background.paper
  }
})

class FullScreenDialogPayment extends Component {
  handleSubmit = () => {
    const { subs } = this.props.browserStorage.state
    let recipients = []
    let amounts = []
    for (let i=0; i<subs.length; i++) {
      if (subs[i].hostname !== "gratiis#mostViewedSites") {
        recipients.push(subs[i].hostname)
        amounts.push(subs[i].amount)
      }
    }
    if (subs[0].amount !== 0) { // if Most Viewed Sites are being paid
      getViews().then(views => {
        for (let view in views) {
          recipients.push(view.hostname)
          amounts.push(view.share * subs[0].amount)
        }
        console.log(donateToMany(recipients, amounts))
      })
    } else {
      console.log(donateToMany(recipients, amounts))
    }
    this.handleCancel()
  };

  handleCancel = () => {
    const paymentSchedule = this.props.browserStorage.state.settings.paymentSchedule
    const nextMonth = new Date((new Date(Date.now())).getFullYear(), (new Date(Date.now())).getMonth() + 1)
    const newNextPayment = strings.paymentSchedule[paymentSchedule](nextMonth)

    this.props.browserStorage.handleChange("nextPayment", newNextPayment)
  };

  handlePostpone = (numberOfMilliseconds) => () => {
    const newNextPayment = this.props.browserStorage.nextPayment + numberOfMilliseconds

    this.props.browserStorage.handleChange("nextPayment", newNextPayment)
  };

  render() {
    const { classes, browserStorage } = this.props
    if (!browserStorage.state) return ''
    const { subs, nextPayment, settings } = browserStorage.state
    const totalAmount = subs.map(sub => sub.amount).reduce( (a, b) => a + b, 0 )
    const currencySymbol = strings.currency[settings.currency]
    return (
      <FullScreenDialog
        title="Monthly Payment"
        open={( nextPayment <= Date.now() )}
        onClose={this.handlePostpone(5000)}
      >
        <div className={classes.contentRoot}>
          <List className={classes.subsList}>
            {subs.map((sub, index) => (
              <ListItem key={index}>
                <ListItemText primary={sub.hostname} />
                <ListItemSecondaryAction>
                  {sub.amount}
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
          <Typography variant="title">
            {"Total: " + currencySymbol + totalAmount.toString()}
          </Typography>
          <Button
            onClick={this.handlePostpone(5000)}
            variant="outlined"
            size="medium"
            color="secondary"
          >
            Postpone
          </Button>
          <Button
            onClick={this.handleCancel}
            variant="outlined"
            size="medium"
            color="secondary"
          >
            Cancel
          </Button>
          <Button
            onClick={this.handleSubmit}
            variant="outlined"
            size="medium"
            color="secondary"
          >
            Submit
          </Button>
        </div>
      </FullScreenDialog>
    )
  }
}

FullScreenDialogPayment = withStyles(styles)(FullScreenDialogPayment)
export default (props) => (
  <BrowserStorageContext.Consumer>
    {browserStorage => <FullScreenDialogPayment {...props} browserStorage={browserStorage} />}
  </BrowserStorageContext.Consumer>
)
