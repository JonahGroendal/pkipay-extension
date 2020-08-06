import React from 'react'
import { ThemeProvider } from '@material-ui/styles'
import { createMuiTheme } from '@material-ui/core/styles'
import appConfig from '../api/appConfig'
// import blueGrey from '@material-ui/core/colors/blueGrey'
// import amber from '@material-ui/core/colors/amber'
import CreatePasswordScreen from '../containers/CreatePasswordScreen'
import UnlockWalletScreen from '../containers/UnlockWalletScreen'
import Pages from '../containers/Pages'
import CssBaseline from '@material-ui/core/CssBaseline'

function App({ darkMode }) {
  const theme = createMuiTheme({
    palette: {
      type: darkMode ? 'dark' : 'light',
      primary: { main: '#2069df'},
      secondary: { main: '#20df29' }
    },
    overrides: {
      MuiTooltip: {
        tooltip: {
          fontSize: "1em"
        }
      }
    }
  })
  if (process.env.REACT_APP_ACTUAL_ENV !== 'production')
    console.log('theme:', theme)

  return (
    <ThemeProvider theme={theme}>
      <div style={{ width: appConfig.width, height: appConfig.height }}>
        <CssBaseline />
        <CreatePasswordScreen />
        <UnlockWalletScreen />
        <Pages />
      </div>
    </ThemeProvider>
  )
}

export default App
