import React from 'react'
import CreateWalletScreenContainer from '../containers/CreateWalletScreenContainer'
import UnlockWalletScreenContainer from '../containers/UnlockWalletScreenContainer'
import Pages from './Pages'
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
  })
  return (
    <MuiThemeProvider theme={theme}>
      <React.Fragment>
        <CssBaseline />
        <CreateWalletScreenContainer />
        <UnlockWalletScreenContainer />
        <Pages />
      </React.Fragment>
    </MuiThemeProvider>
  )
}

export default App
