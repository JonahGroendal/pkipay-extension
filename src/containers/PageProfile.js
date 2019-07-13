import React from 'react'
import { connect } from 'react-redux'
import PresentationalComponent from '../components/PageProfile'
import { getUrl, getHostname } from '../api/browser'
import { getDomainOwner } from '../api/blockchain'
import { setObjectHostname } from '../actions'

function PageProfile({ subscription, dnsChallengeChanged, onChangeHostname }) {
  const [domainOwner, setDomainOwner] = React.useState('0x0000000000000000000000000000000000000000')

  React.useEffect(() => {
    getUrl().then(url => onChangeHostname(getHostname(url)))
  }, [])

  React.useEffect(() => {
    if (subscription.hostname)
      getDomainOwner(subscription.hostname).then(setDomainOwner)
  }, [subscription.hostname, dnsChallengeChanged])

  return React.createElement(PresentationalComponent, {
    subscription,
    domainOwner
  })
}

const mapStateToProps = state => ({
  subscription: { hostname: state.objectHostname },
  dnsChallengeChanged: state.dnsChallenge.recordName === ''
})
const mapDispatchToProps = dispatch => ({
  onChangeHostname: h => dispatch(setObjectHostname(h))
})
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PageProfile)
