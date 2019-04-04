import React from 'react'
import CreateWalletScreenContainer from '../containers/CreateWalletScreenContainer'
import UnlockWalletScreenContainer from '../containers/UnlockWalletScreenContainer'
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
  console.log(theme)
  return (
    <MuiThemeProvider theme={theme}>
      <div>
        <CssBaseline />
        <CreateWalletScreenContainer />
        <UnlockWalletScreenContainer />
        <Pages />
      </div>
    </MuiThemeProvider>
  )
}

export default App
