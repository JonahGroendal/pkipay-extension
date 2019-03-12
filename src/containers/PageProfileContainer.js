import React from 'react'
import PageProfile from '../components/PageProfile'
import { connect } from 'react-redux'

function PageProfileContainer({ subscription, onChangeSubscription }) {
  return React.createElement(PageProfile, {
    subscription,
    showMostViewedSites: subscription.hostname === 'gratiis#mostViewedSites'
  })
}

const mapStateToProps = state => ({
  subscription: { hostname: state.objectHostname }
})
export default connect(mapStateToProps)(PageProfileContainer)
