import React from 'react'
import PageProfile from '../components/PageProfile'
import { connect } from 'react-redux'

function PageProfileContainer({ subscription, onChangeSubscription }) {
  const showMostViewedSites = subscription.hostname === 'gratiis#mostViewedSites'

  return React.createElement(PageProfile, { subscription, showMostViewedSites })
}

const mapStateToProps = state => ({
  subscription: { hostname: state.objectHostname }
})
export default connect(mapStateToProps)(PageProfileContainer)
