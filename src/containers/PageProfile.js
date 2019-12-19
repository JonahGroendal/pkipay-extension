import React from 'react'
import { connect } from 'react-redux'
import PresentationalComponent from '../components/PageProfile'
import { getUrl, getHostname } from '../api/browser'
import { domainNameToEnsName, getEnsNodeOwner, getPendingWithdrawals } from '../api/blockchain'
import { setObjectHostname } from '../actions'

function PageProfile({ hostname, dnsChallengeChanged, address, onChangeHostname }) {
  const domainName = hostname.split('.').slice(-2).join('.')
  const [domainOwner, setDomainOwner] = React.useState('0x0000000000000000000000000000000000000000')
  const [pendingWithdrawals, setPendingWithdrawals] = React.useState(null)
  const pendingWithdrawalsExist = pendingWithdrawals !== null && Object.keys(pendingWithdrawals).length > 0

  React.useEffect(() => {
    getUrl().then(url => onChangeHostname(getHostname(url)))
  }, [])

  React.useEffect(() => {
    if (domainName) {
      const ensName = domainNameToEnsName(domainName)
      getEnsNodeOwner(ensName).then(owner => {
        setDomainOwner(owner)
        if (owner === address) {
          getPendingWithdrawals(domainNameToEnsName(domainName))
          .then(setPendingWithdrawals)
        }
      })
    }
  }, [domainName, dnsChallengeChanged, address])

  return React.createElement(PresentationalComponent, {
    hostname,
    domainName,
    domainOwner,
    address,
    pendingWithdrawals,
    setPendingWithdrawals,
    pendingWithdrawalsExist
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
