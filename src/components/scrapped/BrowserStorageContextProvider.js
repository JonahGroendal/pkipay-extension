import React, { Component } from 'react'
import BrowserStorageContext from './BrowserStorageContext'
import strings from './api/strings'
import set from 'lodash/set'

const nextMonth = new Date((new Date(Date.now())).getFullYear(), (new Date(Date.now())).getMonth() + 1)
const defaultState = {
  settings: {
    currency: "USD",
    paymentSchedule: 'firstOfTheMonth',
    themeType: 'light',
  },
  nextPayment: strings.paymentSchedule.firstOfTheMonth(nextMonth),
  subs: [
    // Permanent subscription
    // `amount` is denominated in settings.currency
    // gratiis#mostViewedSites must be at index 0
    {hostname: "gratiis#mostViewedSites", amount: 0, name: "Most Viewed Sites", permanent: true },
    {hostname: "open.spotify.com", amount: 5 },
  ],
}

export default class BrowserStorageContextProvider extends Component {

  componentDidMount() {
    this.get({ reactApp: defaultState })
    .then(storageData => {
      this.setState(storageData.reactApp)
      if (storageData.reactApp.settings.themeType === 'dark')
        this.props.onChangeThemeType('dark')
    })
    .catch(error => {
      console.log(error)
    })
  }

  handleChange = (path, value) => {
    const state = JSON.parse(JSON.stringify(this.state))
    set(state, path, value)
    this.setState(state, this.saveStateToBrowserStorage)
    if (path === 'settings.themeType')
      this.props.onChangeThemeType(value)
  }

  upsertToSubs = (hostname, amount) => {
    let subs = JSON.parse(JSON.stringify(this.state.subs))
    const index = subs.findIndex(s => s.hostname === hostname)
    if (index !== -1) {
      subs[index].hostname = hostname
      subs[index].amount = Number(amount)
    } else {
      subs.push({ hostname: hostname, amount: Number(amount) })
    }
    this.handleChange('subs', subs)
  }

  removeFromSubs = (hostname) => {
    let subs = JSON.parse(JSON.stringify(this.state.subs))
    const index = subs.findIndex(s => s.hostname === hostname)
    if (index === -1) return
    if (subs[index].permanent) subs[index].amount = 0
    else subs.splice(index, 1)

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
    const upsertToSubs = this.upsertToSubs
    const removeFromSubs = this.removeFromSubs

    return (
      <BrowserStorageContext.Provider value={{ state, handleChange, upsertToSubs, removeFromSubs }}>
        {this.props.children}
      </BrowserStorageContext.Provider>
    )
  }
}
