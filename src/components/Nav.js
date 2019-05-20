import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import TransactionScreen from '../containers/TransactionScreen'
import Settings from './Settings'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import Tabs from '@material-ui/core/Tabs'

const Nav = ({ tabIndex, children, onChangeTab, classes }) => (
  <div className={classes.root}>
    <AppBar position="static" className={classes.appBar}>
      <Toolbar className={classes.toolbar}>
        <Typography variant="h6" color="inherit" className={classes.flex}>
          PkiPay
        </Typography>
        <TransactionScreen />
        <Settings />
      </Toolbar>
      <Tabs
        value={tabIndex}
        onChange={(event, value) => onChangeTab(value)}
        variant="fullWidth"
      >
        {children}

      </Tabs>
    </AppBar>
  </div>
)

const styles = theme => ({
  root: {
    flexGrow: 1,
  },
  toolbar: {
    minHeight: theme.spacing.unit * 6
  },
  flex: {
    flex: 1,
  },
  menuButton: {
    marginLeft: -12,
    marginRight: 20,
  },
})

export default withStyles(styles)(Nav);
