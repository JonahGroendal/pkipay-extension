/*global browser*/
import React, { Component } from 'react'
import EnhancedViewsTable from './EnhancedViewsTable'

export default class Tab3 extends Component {
  constructor(props) {
    super(props)
    this.state = {
      views: []
    }
    this.getViews = this.getViews.bind(this)
  }

  async componentDidMount() {
    let rawViews = await this.getViews()
    let views = []
    rawViews.forEach(rawView => {
      let name = rawView.name
      if (rawView.name === rawView.hostname) {
        name = this.formatHostname(name)
      }
      views.push({
        id: rawView.siteId,
        name: name,
        duration: this.formatDuration(rawView.duration),
        views: rawView.views,
        share: rawView.share
      }) // Using siteId as id might be problematic
    })

    this.setState({
      views: views
    })
  }

  getViews() {
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
     var parts = hostname.split(".");
     return parts[parts.length - 2] + "." + parts[parts.length - 1];
  }

  formatDuration(duration)
  {
     var hours = Math.floor(duration/3600);
     duration %= 3600;
     var minutes = Math.floor(duration/60);
     var seconds = Math.floor(duration % 60);

     return hours.toString().padStart(2, "0") + ":" + minutes.toString().padStart(2, "0") + ":" + seconds.toString().padStart(2, "0");
  }

  render() {
    return (
      <div className="tab">
        <EnhancedViewsTable views={this.state.views}/>
      </div>
    );
  }
}
