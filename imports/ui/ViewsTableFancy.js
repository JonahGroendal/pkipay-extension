/*global browser*/
import React, { Component } from 'react'
import EnhancedViewsTable from './EnhancedViewsTable'
import Settings from '../api/Settings.js'
import Subscriptions from '../api/Subscriptions.js'
import { withTracker } from 'meteor/react-meteor-data'

const tracker = () => {
  return {
    settings: Settings.findOne(),
    subs: Subscriptions.find().fetch(),
  }
}

class ViewsTableFancy extends Component {
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
    if (!this.props.settings || !this.props.subs) return ''
    const budget = this.props.settings.budget
    return (
      <EnhancedViewsTable views={this.state.views} subs={this.state.subs} budget={budget}/>
    )
  }
}

export default withTracker(tracker)(ViewsTableFancy)
