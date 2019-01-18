import React from 'react'
import { connect } from 'react-redux'
import App from '../components/App'

function AppContainer({ themeType }) {

  return React.createElement(App, { themeType })
}

const mapStateToProps = state => ({
  themeType: state.settings.themeType
})

export default connect(mapStateToProps)(AppContainer)
