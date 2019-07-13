import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import { Scrollbars } from 'react-custom-scrollbars'

const Page = ({ classes, children }) => (
  <Scrollbars style={{ height: 504 }}>
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
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    paddingBottom: theme.spacing(1),
  },
  card: {
    marginTop: theme.spacing(2)
  }
})

export default withStyles(styles)(Page)
