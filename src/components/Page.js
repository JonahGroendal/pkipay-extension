import React, { Component } from 'react'
import { withStyles } from '@material-ui/core/styles'
import { Scrollbars } from 'react-custom-scrollbars'

const Page = ({ classes, children }) => (
  <Scrollbars autoHide style={{ height: 504 }}>
    <div className={classes.root}>
      {React.Children.map(children, child => { return (
        <div className={classes.card}>
          { child }
        </div>
      )})}
    </div>
  </Scrollbars>
)

const styles = theme => ({
  root: {
    paddingLeft: theme.spacing.unit,
    paddingRight: theme.spacing.unit,
    paddingBottom: theme.spacing.unit,
  },
  card: {
    marginTop: theme.spacing.unit * 2
  }
})

export default withStyles(styles)(Page)
