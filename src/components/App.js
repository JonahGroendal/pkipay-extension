import React from 'react'
import CreateWalletScreen from '../containers/CreateWalletScreen'
import UnlockWalletScreen from '../containers/UnlockWalletScreen'
import Pages from '../containers/Pages'
import CssBaseline from '@material-ui/core/CssBaseline'
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles'
import deepPurple from '@material-ui/core/colors/deepPurple'
import blue from '@material-ui/core/colors/blue';

function App({ themeType }) {
  const theme = createMuiTheme({
    palette: {
      type: themeType,
      primary: deepPurple,
      secondary: blue,
    },
    typography: {
      useNextVariants: true,
    },
  })
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
