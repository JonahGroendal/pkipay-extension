import React from 'react'
import { makeStyles } from '@material-ui/styles'
import { Scrollbars } from 'react-custom-scrollbars'

const useStyles = makeStyles(theme => ({
  root: {
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    paddingBottom: theme.spacing(1),
  },
  card: {
    marginTop: theme.spacing(2)
  }
}));

function Page({ children, height, titleCard }) {
  const classes = useStyles()

  return (
    <Scrollbars style={{ height }}>
      { titleCard }
      <div className={classes.root}>
        {React.Children.map(children, child => { return (
          <div className={classes.card}>
            { child }
          </div>
        )})}
      </div>
    </Scrollbars>
  )
}

export default Page
