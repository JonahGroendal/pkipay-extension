import React from 'react'
import PresentationalComponent from '../components/Settings'
import datetimeCalculators from '../api/datetimeCalculators.js'
import browser from '../api/browser'
import { connect } from 'react-redux';
import { changeSetting } from '../actions'
import currencySymbols from '../api/currencySymbols'

const settingsOptions = {
  'Currency': Object.keys(currencySymbols),
  'Payment schedule': Object.keys(datetimeCalculators)
}

function Settings({ keystore, currentSettings, onChangeSetting }) {
  return React.createElement(PresentationalComponent, {
    settingsOptions,
    currentSettings,
    onChangeSetting,
    onClickDownloadWallet: () => {
      keystore.forEach(wallet => {
        let file = new File([JSON.stringify(wallet)], 'pkipay-keystore.json', {type: 'text/plain'})
        browser.downloads.download({url: URL.createObjectURL(file), filename: 'pkipay-keystore.json'})
      })
    },
  })
}

const mapStateToProps = state => ({
  currentSettings: state.settings,
  keystore: state.wallet.keystore
})
const mapDispatchToProps = dispatch => ({
  onChangeSetting: (name, value) => dispatch(changeSetting(name, value))
})
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Settings)
