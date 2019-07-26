import React from 'react'
import { ThemeProvider } from '@material-ui/styles'
import { createMuiTheme } from '@material-ui/core/styles'
import blueGrey from '@material-ui/core/colors/blueGrey'
import amber from '@material-ui/core/colors/amber'
import CreateWalletScreen from '../containers/CreateWalletScreen'
import UnlockWalletScreen from '../containers/UnlockWalletScreen'
import Pages from '../containers/Pages'
import CssBaseline from '@material-ui/core/CssBaseline'

function App({ themeType }) {
  const theme = createMuiTheme({
    palette: {
      type: themeType,
      primary: amber,
      secondary: blueGrey
    }
  })
  console.log('theme:', theme)

  return (
    <ThemeProvider theme={theme}>
      <div >
        <CssBaseline />
        <CreateWalletScreen />
        <UnlockWalletScreen />
        <Pages />
      </div>
    </ThemeProvider>
  )
}

export default App
