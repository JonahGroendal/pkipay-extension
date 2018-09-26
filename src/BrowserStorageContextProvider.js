import React, { Component } from 'react'
import BrowserStorageContext from './BrowserStorageContext'
import strings from './api/strings'
import set from 'lodash/set'

const nextMonth = new Date((new Date(Date.now())).getFullYear(), (new Date(Date.now())).getMonth() + 1)
const defaultState = {
  settings: {
    currency: "USD",
    paymentSchedule: 'firstOfTheMonth'
  },
  nextPayment: Date.now(), //strings.paymentSchedule.firstOfTheMonth(nextMonth),
  subs: [
    // Permanent subscription
    // `amount` is denominated in settings.currency
    {hostname: "gratiis#mostViewedSites", amount: 0 },
    {hostname: "open.spotify.com", amount: 5 }
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

  appendToSubs = (hostname, amount) => {
    const sub = { hostname: hostname, amount: Number(amount) }
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

  render() {
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
