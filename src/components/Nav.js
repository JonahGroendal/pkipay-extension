import React, { Component } from 'react'
import Settings from './Settings'
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import Tabs from '@material-ui/core/Tabs'
import Button from '@material-ui/core/Button'

function Nav({ classes, tabIndex, children, onChangeTab }) {
  return (
    <div className={classes.root}>
      <AppBar position="static" className={classes.appBar}>
        <Toolbar className={classes.toolbar}>
          <Typography variant="title" color="inherit" className={classes.flex}>
            Gratiis
          </Typography>
          <Settings />
        </Toolbar>
        <Tabs
          value={tabIndex}
          onChange={onChangeTab}
          fullWidth
        >

          {children}

        </Tabs>
      </AppBar>
    </div>
  )
}

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
