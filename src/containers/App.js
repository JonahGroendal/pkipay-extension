import React from 'react'
import { connect } from 'react-redux'
import PresentationalComponent from '../components/App'

function App({ darkMode }) {

  return React.createElement(PresentationalComponent, {
    darkMode
  })
}

const mapStateToProps = state => ({
  darkMode: state.settings['Dark mode']
})

export default connect(mapStateToProps)(App)
