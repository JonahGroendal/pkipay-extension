import React from 'react'
import { makeStyles } from '@material-ui/styles'

const useStyles = makeStyles(theme => ({
  root: {
    overflow: 'auto',
    'scrollbar-width': 'none', // Firefox
    '&::-webkit-scrollbar': {  // Chrome
      display: 'none'
    }
  },
  container: {
    padding: theme.spacing(1)
  },
  topCard: {
    marginTop: 0
  },
  card: {
    marginTop: theme.spacing(2)
  }
}));

function Page({ children, height }) {
  const classes = useStyles()

  return (
    <div className={classes.root} style={{ height }}>
      <div className={classes.container}>
        {React.Children.map(children, (child, i) => { return (
          <div className={i===0 ? classes.topCard : classes.card}>
            { child }
          </div>
        )})}
      </div>
    </div>
  )
}

export default Page
