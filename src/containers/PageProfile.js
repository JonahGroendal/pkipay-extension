import React from 'react'
import { connect } from 'react-redux'
import PresentationalComponent from '../components/PageProfile'
import { getUrl, getHostname } from '../api/browser'
import { domainNameToEnsName, getEnsNodeOwner } from '../api/blockchain'
import { setObjectHostname } from '../actions'

function PageProfile({ hostname, dnsChallengeChanged, address, onChangeHostname }) {
  const domainName = hostname.split('.').slice(-2).join('.')
  const [domainOwner, setDomainOwner] = React.useState('0x0000000000000000000000000000000000000000')

  React.useEffect(() => {
    getUrl().then(url => onChangeHostname(getHostname(url)))
  }, [])

  React.useEffect(() => {
    if (domainName) {
      const ensName = domainNameToEnsName(domainName)
      getEnsNodeOwner(ensName).then(setDomainOwner)
    }
  }, [domainName, dnsChallengeChanged])

  return React.createElement(PresentationalComponent, {
    hostname,
    domainName,
    domainOwner,
    address
  })
}

const mapStateToProps = state => ({
  hostname: state.objectHostname,
  dnsChallengeChanged: state.dnsChallenge.recordName === '',
  address: state.wallet.addresses[state.wallet.defaultAccount]
})
const mapDispatchToProps = dispatch => ({
  onChangeHostname: h => dispatch(setObjectHostname(h))
})
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PageProfile)
