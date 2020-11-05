import React from 'react'
import { makeStyles } from '@material-ui/styles'
import Settings from '../containers/Settings'
import TransactionScreen from '../containers/TransactionScreen'
import ReportIssue from '../components/ReportIssue'
import Typography from '@material-ui/core/Typography'

const useStyles = makeStyles(theme => ({
  toolbar: {
    paddingRight: theme.spacing(3),
    paddingLeft: theme.spacing(3),
    minHeight: theme.spacing(6),
    display: 'flex',
    justifyContent: 'space-between'
  },
  titleColumn: {
    display: 'flex',
    alignItems: 'center'
  }
}));

function Nav({ tabIndex, children, onChangeTab }) {
  const classes = useStyles()

  return (
    <div>
      <div className={classes.appBar}>
        <div className={classes.toolbar}>
          <div className={classes.titleColumn}>
            <Typography variant="h6">
              PkiPay
            </Typography>
            <img src="titleEmojis.png" alt="" />
          </div>
          <div className={classes.titleColumn}>
            <ReportIssue />
            <TransactionScreen />
            <Settings />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Nav;
