import React from 'react'
import { connect } from 'react-redux'
import PresentationalComponent from '../components/PageProfile'
import { getUrl, getHostname } from '../api/browser'
import { domainNameToEnsName, getEnsNodeOwner, getPendingWithdrawals } from '../api/blockchain'
import { setTarget } from '../actions'
import { isDomainName, isEnsName, isEnsNode } from '../api/utils'

function PageProfile({ target, dnsChallengeChanged, address, onChangeTarget }) {
  const hostname = isDomainName(target) ? target : ''
  const ensAddress = isDomainName(target)
    ? domainNameToEnsName(target.split('.').slice(-2).join('.'))
    : isEnsName(target) || isEnsNode(target)
      ? target
      : ''

  const [ensAddressOwner, setEnsAddressOwner] = React.useState('0x0000000000000000000000000000000000000000')
  const [pendingWithdrawals, setPendingWithdrawals] = React.useState(null)
  const pendingWithdrawalsExist = pendingWithdrawals !== null && Object.keys(pendingWithdrawals).length > 0

  React.useEffect(() => {
    getUrl().then(url => onChangeTarget(getHostname(url)))
  }, [])

  React.useEffect(() => {
    if (ensAddress) {
      getEnsNodeOwner(ensAddress).then(owner => {
        setEnsAddressOwner(owner)
        if (owner === address) {
          getPendingWithdrawals(ensAddress)
          .then(setPendingWithdrawals)
        }
      })
    }
  }, [ensAddress, dnsChallengeChanged, address])

  return React.createElement(PresentationalComponent, {
    hostname,
    ensAddress,
    ensAddressOwner,
    address,
    pendingWithdrawals,
    setPendingWithdrawals,
    pendingWithdrawalsExist
  })
}

const mapStateToProps = state => ({
  target: state.target,
  dnsChallengeChanged: state.dnsChallenge.recordName === '',
  address: state.wallet.addresses[state.wallet.defaultAccount]
})
const mapDispatchToProps = dispatch => ({
  onChangeTarget: h => dispatch(setTarget(h))
})
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PageProfile)
