import React, { Component } from 'react'
import StorageDbContext from './StorageDbContext'

export default class StorageDbContextProvider extends Component {
  constructor(props) {
    super(props)
    this.state = {
      views: [],
      sites: []
    }

    this.getViews = this.getViews.bind(this)
  }

  async componentWillMount() {
    this.getViews()
    .then(rawViews => {
      let views = []
      rawViews.forEach(rawView => {
        let name = rawView.name
        if (name === rawView.hostname) {
          name = this.formatHostname(name)
        }
        views.push({
          id: rawView.siteId,
          name: name,
          hostname: rawView.hostname,
          duration: this.formatDuration(rawView.duration),
          views: rawView.views,
          share: rawView.share
        }) // Using siteId as id might be problematic
      })
      this.setState({
        views: views
      })
    })
    .catch(console.log)
  }

  // Views must be gotten via background.js due to BATify's use of the storagedb.js
  // background page
  getViews() {
    let browser = this.props.browser
    return new Promise(function(resolve, reject) {
      browser.runtime.sendMessage({action: "getViews"}, function(views) {
        if (browser.runtime.lastError) {
          reject(browser.runtime.lastError)
        }
        else {
          resolve(views)
        }
      });
    })
  }

  formatHostname(hostname)
  {
    let parts = hostname.split(".")
    return parts[parts.length-2].slice(0, 1).toUpperCase() + parts[parts.length-2].slice(1)
  }

  formatDuration(duration)
  {
     var hours = Math.floor(duration/3600)
     duration %= 3600
     var minutes = Math.floor(duration/60)
     var seconds = Math.floor(duration % 60)

     return hours.toString().padStart(2, "0") + ":" + minutes.toString().padStart(2, "0") + ":" + seconds.toString().padStart(2, "0")
  }

  render() {
    return (
      <StorageDbContext.Provider value={this.state}>
        {this.props.children}
      </StorageDbContext.Provider>
    )
  }
}
