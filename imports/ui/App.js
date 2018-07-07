/*global browser*/
import React, { Component } from 'react'
import Nav from './Nav'
import Tab1 from './Tab1'
import Tab2 from './Tab2'
import Tab3 from './Tab3'
import Web3ContextProvider from './Web3ContextProvider'
import CssBaseline from '@material-ui/core/CssBaseline'
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles'
import { withStyles } from '@material-ui/core/styles'
import Tab from '@material-ui/core/Tab'
import SwipeableViews from 'react-swipeable-views';

const theme = createMuiTheme()

export default class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      // url: "",
      // shortUrl: "",
      shortUrl: this.shorten(props.url),
      tabIndex: 0,
    }
    this.handleChangeTab = this.handleChangeTab.bind(this)
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

  shorten(url) {
    if (url.substring(0, 5) !== 'https') {
      return "";
    }
    console.log("url being split:")
    console.log(url)
    let parts = url.split(".", 3);
    if (parts.length === 2) {
      return parts[0].split("//")[1] + '.' + parts[1].split("/", 1)
    }
    return parts[1] + '.' + parts[2].split("/", 1)
  }

  handleChangeTab = (event, value) => {
    this.setState({ tabIndex: value })
  }

  render() {
    return (
      <Web3ContextProvider>
        <MuiThemeProvider theme={theme}>
          <React.Fragment>
            <CssBaseline />
            <Nav
              tabIndex={this.state.tabIndex}
              onChangeTab={this.handleChangeTab}
            >
              <Tab label="This Month" />
              <Tab label="Tab Two" />
              <Tab label="Tab Three" />
            </Nav>
            <SwipeableViews index={this.state.tabIndex}>
              <Tab1 />
              <Tab2 shortUrl={this.state.shortUrl}/>
              <Tab3 />
            </SwipeableViews>
          </React.Fragment>
        </MuiThemeProvider>
      </Web3ContextProvider>
    );
  }
}
