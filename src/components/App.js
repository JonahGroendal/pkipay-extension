import React from 'react'
import CreateWalletScreen from '../containers/CreateWalletScreen'
import UnlockWalletScreen from '../containers/UnlockWalletScreen'
import Pages from '../containers/Pages'
import CssBaseline from '@material-ui/core/CssBaseline'
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles'
import blueGrey from '@material-ui/core/colors/blueGrey'
import amber from '@material-ui/core/colors/amber';

function App({ themeType }) {
  const theme = createMuiTheme({
    palette: {
      type: themeType,
      primary: amber,
      secondary: blueGrey
    },
    typography: {
      useNextVariants: true,
    },
  })
  console.log(theme)
  // $primary-color-dark:   #FFA000
  // $primary-color:        #FFC107
  // $primary-color-light:  #FFECB3
  // $primary-color-text:   #212121
  // $accent-color:         #03A9F4
  // $primary-text-color:   #212121
  // $secondary-text-color: #757575
  // $divider-color:        #BDBDBD
  return (
    <MuiThemeProvider theme={theme}>
      <div>
        <CssBaseline />
        <CreateWalletScreen />
        <UnlockWalletScreen />
        <Pages />
      </div>
    </MuiThemeProvider>
  )
}

export default App
