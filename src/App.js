import React, { Component } from 'react'
import Nav from './Nav'
import Page from './Page'
import Balance from './Balance'
import Subscriptions from './Subscriptions'
import Hodlings from './Hodlings'
import Profile from './Profile'
import Token from './Token'
import MostViewedSites from './MostViewedSites'
import Web3ContextProvider from './Web3ContextProvider'
import BrowserStorageContextProvider from './BrowserStorageContextProvider'
import FullScreenDialogPayment from './FullScreenDialogPayment'
import browser, { getFromStorage } from './api/browser'
import CssBaseline from '@material-ui/core/CssBaseline'
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles'
import Tab from '@material-ui/core/Tab'
import SwipeableViews from 'react-swipeable-views'

const theme = {
  light: createMuiTheme(),
  dark: createMuiTheme({
    palette: {
      type: 'dark',
    },
  }),
}
console.log(theme.light)

export default class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      tabIndex: 0,
      objectHostname: '',
      themeType: 'light',
    }
  }

  componentDidMount() {
    browser.tabs.query({
      'active': true,
      'lastFocusedWindow': true
    }, (tabs) => {
      const hostname = this.getDomain(tabs[0].url)
      this.setState({ objectHostname: hostname })
    })
  }

  handleChangeTab = (event, value) => {
    this.setState({ tabIndex: value })
  }

  handleChange = key => value => {
    this.setState({ [key]: value })
  }

  render() {
    const { objectHostname, themeType } = this.state
    const isMostViewedSites = (objectHostname === 'gratiis#mostViewedSites')
    return (
      <Web3ContextProvider>
        <BrowserStorageContextProvider browser={browser}
          onChangeThemeType={this.handleChange('themeType')}>
          <MuiThemeProvider theme={theme[themeType]}>
            <React.Fragment>
              <CssBaseline />
              <FullScreenDialogPayment />
              <Nav tabIndex={this.state.tabIndex} onChangeTab={this.handleChangeTab}>
                <Tab label="Profile" />
                <Tab label="Manage" />
              </Nav>
              <SwipeableViews index={this.state.tabIndex}
                onChangeIndex={this.handleChange('tabIndex')}>
                <Page>
                  <Profile hostname={objectHostname}/>
                  {isMostViewedSites && <MostViewedSites />}
                  {!isMostViewedSites && <Token hostname={objectHostname} />}
                </Page>
                <Page>
                  <Balance />
                  <Subscriptions onViewProfile={hostname => {
                    this.handleChange('objectHostname')(hostname)
                    this.handleChangeTab({}, 0) }}/>
                  <Hodlings />
                </Page>
              </SwipeableViews>
            </React.Fragment>
          </MuiThemeProvider>
        </BrowserStorageContextProvider>
      </Web3ContextProvider>
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
