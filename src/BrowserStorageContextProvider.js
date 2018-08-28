import React, { Component } from 'react'
import BrowserStorageContext from './BrowserStorageContext'
import set from 'lodash/set'

const defaultState = {
  settings: {
    budget: 0,
    currency: "USD",
    nextPayout: Date.now() + 30 * 24 * 60 * 60 * 1000, // one month from now
    autoContributeEnabled: false
  },
  subs: [
    // Permanent subscription
    // `amount` is denominated in settings.currency
    { id: 0, hostname: "gratiis#mostViewedSites", name: "Most Viewed Sites", amount: 0 },
    { id: 1, hostname: "open.spotify.com", name: "spotify.com", amount: 5 }
  ]
}

export default class BrowserStorageContextProvider extends Component {

  componentWillMount() {
    this.get({ reactApp: defaultState })
    .then(storageData => {
      this.setState(storageData.reactApp)

    })
    .catch(error => {
      console.log(error)
    })
  }

  handleChange = (path, value) => {
    const state = JSON.parse(JSON.stringify(this.state))
    set(state, path, value)
    this.setState(state, this.saveStateToBrowserStorage)
  }

  appendToSubs = async (hostname, amount) => {
    let views = await this.getViews()
    console.log(views)
    let i = 0
    for (i=0; i<views.length; i++) {
      if (views[i].hostname == hostname)
        break
    }
    const sub = {
      id: Number(views[i].siteId),
      hostname: hostname,
      name: views[i].name,
      amount: Number(amount)
    }
    let subs = JSON.parse(JSON.stringify(this.state.subs))
    subs.push(sub)
    this.handleChange('subs', subs)
  }

  removeFromSubs = (hostname) => {
    if (hostname === "gratiis#mostViewedSites") return;

    let subs = JSON.parse(JSON.stringify(this.state.subs))
    subs = subs.filter(element => element.hostname !== hostname)
    this.handleChange('subs', subs)
  }

  saveStateToBrowserStorage = () => {
    this.props.browser.storage.local.set({ reactApp: this.state })
  }

  get = (keys) => {
    let thisClass = this
    return new Promise(function(resolve, reject) {
      thisClass.props.browser.storage.local.get(keys, function(result) {
        if (!thisClass.props.browser.lastError)
          resolve(result)
        else
          reject(thisClass.props.browser.lastError)
      })
    })
  }

  // Views must be gotten via background.js due to BATify's use of the storagedb.js
  // background page
  getViews = () => {
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

  render(){
    const state = this.state
    const handleChange = this.handleChange
    const appendToSubs = this.appendToSubs
    const removeFromSubs = this.removeFromSubs

    return (
      <BrowserStorageContext.Provider value={{ state, handleChange, appendToSubs, removeFromSubs }}>
        {this.props.children}
      </BrowserStorageContext.Provider>
    )
  }
}
