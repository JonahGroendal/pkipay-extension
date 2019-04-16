import React from 'react'
import { connect } from 'react-redux'
import PresentationalComponent from '../components/App'

function App({ themeType }) {

  return React.createElement(PresentationalComponent, { themeType })
}

const mapStateToProps = state => ({
  themeType: state.settings.themeType
})

export default connect(mapStateToProps)(App)
