import React, { Component } from 'react'
import FullScreenDialog from './FullScreenDialog'
import strings from '../api/strings'
import { donate, donateToMany } from '../api/contractGratis'
import { getViews, getSites } from '../api/storageDb'
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
import { connect } from 'react-redux';
import { setNextPayment } from '../actions';

const styles = theme => ({
  contentRoot: {
    backgroundColor: theme.palette.background.default
  },
  subsList: {
    backgroundColor: theme.palette.background.paper
  }
})

function PaymentScreen(props) {
  const { subscriptions, currency, paymentSchedule, nextPayment, onChangeNextPayment } = props;
  const { classes } = props;

  function handleSubmit() {
    let recipients = []
    let amounts = []
    for (let i=0; i<subscriptions.length; i++) {
      if (subscriptions[i].hostname !== "gratiis#mostViewedSites") {
        recipients.push(subscriptions[i].hostname)
        amounts.push(subscriptions[i].amount)
      }
    }
    if (subscriptions[0].amount !== 0) { // if Most Viewed Sites are being paid
      getViews().then(views => {
        for (let view in views) {
          recipients.push(view.hostname)
          amounts.push(view.share * subscriptions[0].amount)
        }
        console.log(donateToMany(recipients, amounts))
      })
    } else {
      console.log(donateToMany(recipients, amounts))
    }
    handleCancel()
  };

  function handleCancel() {
    const nextMonth = new Date((new Date(Date.now())).getFullYear(), (new Date(Date.now())).getMonth() + 1)
    const newNextPayment = strings.paymentSchedule[paymentSchedule](nextMonth)
    onChangeNextPayment(newNextPayment);
  };

  const handlePostpone = (numberOfMilliseconds) => () => {
    const newNextPayment = nextPayment + numberOfMilliseconds
    onChangeNextPayment(newNextPayment);
  };

  const totalAmount = subscriptions.map(sub => sub.amount).reduce( (a, b) => a + b, 0 )
  const currencySymbol = strings.currency[currency]
  return (
    <FullScreenDialog
      title="Monthly Payment"
      open={( nextPayment <= Date.now() )}
      onClose={handlePostpone(5000)}
    >
      <div className={classes.contentRoot}>
        <List className={classes.subsList}>
          {subscriptions.map((sub, index) => (
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
          onClick={handlePostpone(5000)}
          variant="outlined"
          size="medium"
          color="secondary"
        >
          Postpone
        </Button>
        <Button
          onClick={handleCancel}
          variant="outlined"
          size="medium"
          color="secondary"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
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

PaymentScreen = withStyles(styles)(PaymentScreen)

const mapStateToProps = state => ({
  subscriptions: state.subscriptions,
  currency: state.settings.curency,
  paymentSchedule: state.settings.paymentSchedule,
  nextPayment: state.nextPayment,
})
const mapDispatchToProps = dispatch => ({
  onChangeNextPayment: t => dispatch(setNextPayment(t))
})
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PaymentScreen)
