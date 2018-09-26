import React, { Component } from 'react'
import { withStyles } from '@material-ui/core/styles'

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

function Page(props) {
  const { classes, children } = props
  return (
    <div className={classes.root}>
      {React.Children.map(children, child => { return (
        <div className={classes.card}>
          { child }
        </div>
      )})}
    </div>
  )
}

export default withStyles(styles)(Page)
