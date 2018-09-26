import React, { Component } from 'react'
import { withStyles } from '@material-ui/core/styles'

const styles = theme => ({
  root: {
    paddingLeft: theme.spacing.unit,
    paddingRight: theme.spacing.unit,
    paddingBottom: theme.spacing.unit,
  }
})

function Page(props) {
  return (
    <div className={props.classes.root}>
      { props.children }
    </div>
  )
}

export default withStyles(styles)(Page)
