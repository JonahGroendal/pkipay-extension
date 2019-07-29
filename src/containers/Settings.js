import React from 'react'
import PresentationalComponent from '../components/Settings'
import datetimeCalculators from '../api/datetimeCalculators.js'
import { supportedCurrencies } from '../api/ECBForexRates.js'
import { connect } from 'react-redux';
import { changeSetting } from '../actions'

const settingsOptions = {
  'Currency': supportedCurrencies,
  'Payment schedule': Object.keys(datetimeCalculators)
}

function Settings({ ...mapped }) {
  return React.createElement(PresentationalComponent, {
    settingsOptions,
    ...mapped
  })
}

const mapStateToProps = state => ({
  currentSettings: state.settings
})
const mapDispatchToProps = dispatch => ({
  onChangeSetting: (name, value) => dispatch(changeSetting(name, value))
})
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Settings)
