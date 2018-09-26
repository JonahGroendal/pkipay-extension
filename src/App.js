import browser from './api/browser'
import React, { Component } from 'react'
import Nav from './Nav'
import Page from './Page'
import Balance from './Balance'
import SubscriptionsTable from './SubscriptionsTable'
import Profile from './Profile'
import Web3ContextProvider from './Web3ContextProvider'
import BrowserStorageContextProvider from './BrowserStorageContextProvider'
import FullScreenDialogPayment from './FullScreenDialogPayment'
import CssBaseline from '@material-ui/core/CssBaseline'
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles'
import Tab from '@material-ui/core/Tab'
import SwipeableViews from 'react-swipeable-views'

const theme = createMuiTheme()
console.log(theme)
export default class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      tabIndex: 0,
      objectHostname: '',
    }

    this.handleChangeTab = this.handleChangeTab.bind(this)
  }

  componentWillMount() {
    browser.tabs.query({
      'active': true,
      'lastFocusedWindow': true
    }, (tabs) => {
      const hostname = this.getDomain(tabs[0].url)
      this.setState({objectHostname: hostname})
    })
  }

  // componentDidUpdate(prevProps, prevState, snapshot) {
  //   // Update URL asynchronously after component renders
  //   if (this.state.url === "") {
  //     thisClass = this;
  //     browser.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
  //       thisClass.setState({
  //         url: tabs[0].url,
  //         shortUrl: thisClass.shorten(tabs[0].url)
  //       });
  //     });
  //   }
  // }

  // shorten(url) {
  //   if (url.substring(0, 5) !== 'https') {
  //     return "";
  //   }
  //   console.log("url being split:")
  //   console.log(url)
  //   let parts = url.split(".", 3);
  //   if (parts.length === 2) {
  //     return parts[0].split("//")[1] + '.' + parts[1].split("/", 1)
  //   }
  //   return parts[1] + '.' + parts[2].split("/", 1)
  // }

  handleChangeTab = (event, value) => {
    this.setState({ tabIndex: value })
  }

  handleChangeIndex = index => {
    this.setState({ tabIndex: index });
  };

  handleChangeObject = (objectHostname) => {
    this.setState({ objectHostname: objectHostname })

  }

  render() {
    const { objectHostname } = this.state
    return (
      <Web3ContextProvider>
        <BrowserStorageContextProvider browser={browser}>
          <MuiThemeProvider theme={theme}>
            <React.Fragment>
              <CssBaseline />
              <FullScreenDialogPayment />
              <Nav
                tabIndex={this.state.tabIndex}
                onChangeTab={this.handleChangeTab}
              >
                <Tab label="Profile" />
                <Tab label="Manage" />
              </Nav>
              <SwipeableViews
                index={this.state.tabIndex}
                onChangeIndex={this.handleChangeIndex}
              >
                <Page>
                  <Profile hostname={objectHostname}/>
                </Page>
                <Page>
                  <Balance />
                  <SubscriptionsTable onViewProfile={hostname => {
                    this.handleChangeObject(hostname)
                    this.handleChangeTab({}, 0)
                  }}/>
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
