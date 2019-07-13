import React from 'react'
import { makeStyles } from '@material-ui/core/styles';
import { createMuiTheme } from '@material-ui/core/styles'
import { ThemeProvider } from '@material-ui/styles';
import CreateWalletScreen from '../containers/CreateWalletScreen'
import UnlockWalletScreen from '../containers/UnlockWalletScreen'
import Pages from '../containers/Pages'
import CssBaseline from '@material-ui/core/CssBaseline'
import blueGrey from '@material-ui/core/colors/blueGrey'
import amber from '@material-ui/core/colors/amber';

const useStyles = makeStyles({
  root: {
    height: '600px', // theme.spacing(75)
    width: '352px'   // theme.spacing(44)
  }
})

function App({ themeType }) {
  const classes = useStyles()

  const theme = createMuiTheme({
    palette: {
      type: themeType,
      primary: amber,
      secondary: blueGrey
    }
  })
  console.log(theme)
  // const theme = {
  //   palette: {
  //     type: themeType,
  //     primary: amber,
  //     secondary: blueGrey
  //   }
  // }
  return (
    <ThemeProvider theme={theme}>
      <div className={classes.root}>
        <CssBaseline />
        <CreateWalletScreen />
        <UnlockWalletScreen />
        <Pages />
      </div>
    </ThemeProvider>
  )
}

export default App
