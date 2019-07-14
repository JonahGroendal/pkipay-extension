import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import TransactionScreen from '../containers/TransactionScreen'
import Settings from './Settings'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import Tabs from '@material-ui/core/Tabs'

const Nav = ({ tabIndex, children, onChangeTab, classes }) => (
  <div>
    <AppBar position="static" className={classes.appBar}>
      <Toolbar className={classes.toolbar}>
        <div className={classes.titleColumn}>
          <Typography variant="h6">
            PkiPay
          </Typography>
          <img src="titleEmojis.png" />
        </div>
        <div className={classes.titleColumn}>
          <TransactionScreen />
          <Settings />
        </div>
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
  toolbar: {
    minHeight: theme.spacing(6),
    display: 'flex',
    justifyContent: 'space-between'
  },
  titleColumn: {
    display: 'flex',
    alignItems: 'center'
  }
})

export default withStyles(styles)(Nav);
