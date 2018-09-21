import browser from './api/browser'
import React, { Component } from 'react'
import Nav from './Nav'
import TabManage from './TabManage'
import Tab2 from './Tab2'
import Tab3 from './Tab3'
import FullScreenDialog from './FullScreenDialog'
import Web3ContextProvider from './Web3ContextProvider'
import BrowserStorageContextProvider from './BrowserStorageContextProvider'
import StorageDbContextProvider from './StorageDbContextProvider'
import CssBaseline from '@material-ui/core/CssBaseline'
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles'
import { withStyles } from '@material-ui/core/styles'
import Tab from '@material-ui/core/Tab'
import SwipeableViews from 'react-swipeable-views'

const theme = createMuiTheme()
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

  handleChangeObject = (objectHostname) => {
    this.setState({ objectHostname: objectHostname })

  }

  render() {
    const { objectHostname } = this.state
    return (
      <Web3ContextProvider>
        <BrowserStorageContextProvider browser={browser}>
          <StorageDbContextProvider browser={browser}>
            <MuiThemeProvider theme={theme}>
              <React.Fragment>
                <CssBaseline />
                <Nav
                  tabIndex={this.state.tabIndex}
                  onChangeTab={this.handleChangeTab}
                >
                  <Tab label="Profile" />
                  <Tab label="Manage" />
                </Nav>
                <SwipeableViews index={this.state.tabIndex}>
                  <Tab2 hostname={objectHostname}/>
                  <TabManage
                    onViewProfile={hostname => {
                      this.handleChangeObject(hostname)
                      this.handleChangeTab({}, 0)
                    }}
                  />
                </SwipeableViews>
              </React.Fragment>
            </MuiThemeProvider>
          </StorageDbContextProvider>
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
