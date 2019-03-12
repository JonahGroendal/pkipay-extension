import React from 'react'
import { connect } from 'react-redux'
import PresentationalComponent from '../components/Pages'
import { setTabIndex } from '../actions'

function Pages({ tabIndex, onChangeTab }) {
  return React.createElement(PresentationalComponent, {
    tabIndex,
    onChangeTab
  })
}

const mapStateToProps = state => ({
  tabIndex: state.pages.tabIndex
})
const mapDispatchToProps = dispatch => ({
  onChangeTab: i => dispatch(setTabIndex(i))
})
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Pages)
