/*global browser*/
import React, { Component } from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import {Tabs, Tab} from 'material-ui/Tabs';
import SwipeableViews from 'react-swipeable-views';
import TopBar from './TopBar';
import Tab1 from './Tab1';
import Tab2 from './Tab2';
import Tab3 from './Tab3';
import Web3ContextProvider from './Web3ContextProvider'
//import { DrizzleProvider } from 'drizzle-react'
// import DrizzleContext from './DrizzleContext'
//
// import Gratis from './Gratis.json'


export default class App extends Component {
  constructor(props) {
    super(props)
    // const options = {
    //   contracts: [
    //     Gratis
    //   ]
    // }
    this.state = {
      // url: "",
      // shortUrl: "",
      //drizzle: new Drizzle(options, generateStore(options));
      shortUrl: this.shorten(props.url),
      slideIndex: 0,
    }

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

  handleChange = (value) => {
    this.setState({
      slideIndex: value,
    });
  };

  shorten(url) {
    if (url.substring(0, 5) !== 'https') {
      return "";
    }
    let parts = url.split(".", 3);
    return parts[1] + '.' + parts[2].split("/", 1);
  }

  render() {
    return (
      <Web3ContextProvider>
        <MuiThemeProvider>
          <div>
            <TopBar shortUrl={this.state.shortUrl} />
            <Tabs
              onChange={this.handleChange}
              value={this.state.slideIndex}
            >
              <Tab label="Tab One" value={0} />
              <Tab label="Tab Two" value={1} />
              <Tab label="Tab Three" value={2} />
            </Tabs>
            <SwipeableViews
              index={this.state.slideIndex}
              onChangeIndex={this.handleChange}
            >
              <div className="tab">
                <Tab1 />
              </div>
              <div className="tab">
                <Tab2 shortUrl={this.state.shortUrl}/>
              </div>
              <div className="tab">
                <Tab3 />
              </div>
            </SwipeableViews>
          </div>
        </MuiThemeProvider>
      </Web3ContextProvider>
    );
  }
}
