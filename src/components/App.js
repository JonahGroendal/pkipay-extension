import React, { Component } from 'react'
import Nav from './Nav'
import Page from './Page'
import Balance from './Balance'
import Subscriptions from './Subscriptions'
import Hodlings from './Hodlings'
import Profile from './Profile'
import Donate from './Donate'
import Token from './Token'
import MostViewedSites from './MostViewedSites'
import PaymentScreen from './PaymentScreen'
import browser, { getFromStorage } from '../api/browser'
import CssBaseline from '@material-ui/core/CssBaseline'
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles'
import Tab from '@material-ui/core/Tab'
import SwipeableViews from 'react-swipeable-views'
import deepPurple from '@material-ui/core/colors/deepPurple'
import blue from '@material-ui/core/colors/blue';
import { connect } from 'react-redux'

const theme = {
  light: createMuiTheme({
    palette: {
      primary: deepPurple,
      secondary: blue,
    },
  }),
  dark: createMuiTheme({
    palette: {
      type: 'dark',
      primary: deepPurple,
      secondary: blue,
    },
  }),
}
console.log(theme.light)

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      tabIndex: 0,
      subscription: { hostname: '' },
    }
  }

  componentDidMount() {
    browser.tabs.query({
      'active': true,
      'lastFocusedWindow': true
    }, (tabs) => {
      const hostname = this.getDomain(tabs[0].url)
      this.setState({ subscription: { hostname: hostname } })
    })
  }

  handleChangeTab = (event, value) => {
    this.setState({ tabIndex: value })
  }

  handleChange = key => value => {
    this.setState({ [key]: value })
  }

  render() {
    const { themeType } = this.props
    const { subscription } = this.state
    const isMostViewedSites = (subscription.hostname === 'gratiis#mostViewedSites')
    return (
      <MuiThemeProvider theme={theme[themeType]}>
        <React.Fragment>
          <CssBaseline />
          <PaymentScreen />
          <Nav tabIndex={this.state.tabIndex} onChangeTab={this.handleChangeTab}>
            <Tab label="Profile" />
            <Tab label="Manage" />
          </Nav>
          <SwipeableViews index={this.state.tabIndex}
            onChangeIndex={this.handleChange('tabIndex')}>
            <Page>
              <Profile subscription={subscription}/>
              <Donate subscription={subscription} />
              {isMostViewedSites && <MostViewedSites />}
              {!isMostViewedSites && <Token hostname={subscription.hostname} />}
            </Page>
            <Page>
              <Balance />
              <Subscriptions onViewProfile={subscription => {
                this.handleChange('subscription')(subscription)
                this.handleChangeTab({}, 0)
              }}/>
              <Hodlings />
            </Page>
          </SwipeableViews>
        </React.Fragment>
      </MuiThemeProvider>
    );
  }

  // Same as tabHandler.getDomain() in background.js
  getDomain(url)
  {
    console.log(url)
     if (url.match(/(http|https):\/\/[^0-9.]+/)) {
        var a = document.createElement("a");
        a.href = url;

        return a.hostname;
     }
     else {
        return '';
     }
  }
}

const mapStateToProps = state => ({
  themeType: state.settings.themeType
})
export default connect(mapStateToProps)(App)
