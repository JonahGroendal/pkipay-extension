import React from 'react'
import { connect } from 'react-redux'
import PresentationalComponent from '../components/PageProfile'
import { getUrl, getHostname } from '../api/browser'
import { domainNameToEnsName, resolveAddress, getPendingWithdrawals, addresses } from '../api/blockchain'
import { setTarget } from '../actions'
import { isDomainName, isEnsName, isEnsNode } from '../api/utils'

function PageProfile({ target, address, onChangeTarget, priceOfETHInUSD, onChangeTab }) {
  const hostname = isDomainName(target) ? target : ''
  const ensAddress = isDomainName(target)
    ? domainNameToEnsName(target.split('.').slice(-2).join('.'))
    : isEnsName(target) || isEnsNode(target)
      ? target
      : ''

  React.useEffect(() => {
    getUrl().then(url => onChangeTarget(getHostname(url)))
  }, [])

  const [resolvedAddress, setResolvedAddress] = React.useState('0x0000000000000000000000000000000000000000')
  const [pendingWithdrawalsExist, setPendingWithdrawalsExist] = React.useState(false)
  const [pendingWithdrawalsETH, setPendingWithdrawalsETH] = React.useState(0)
  const [pendingWithdrawalsDAI, setPendingWithdrawalsDAI] = React.useState(0)
  const [pendingWithdrawalsRest, setPendingWithdrawalsRest] = React.useState(0)
  React.useEffect(() => {
    if (ensAddress) {
      resolveAddress(ensAddress).then(resolvedAddr => {
        setResolvedAddress(resolvedAddr)
        if (resolvedAddr === '0x0000000000000000000000000000000000000000') {
          getPendingWithdrawals(ensAddress)
          .then(pws => {
            setPendingWithdrawalsExist(pws !== null && Object.keys(pws).length > 0)
            const pwsETH = pws !== null && pws[addresses.ETH] ? pws[addresses.ETH].reduce((a, c) => a + c.balance, 0) : 0
            const pwsDAI = pws !== null && pws[addresses.DAI] ? pws[addresses.DAI].reduce((a, c) => a + c.balance, 0) : 0
            const pwsRest = pws !== null ? Object.values(pws).map(pw => pw.reduce((a, c) => a + c.balance, 0)).reduce((a, c) => a + c, 0) - pwsETH - pwsDAI : 0
            setPendingWithdrawalsETH(pwsETH)
            setPendingWithdrawalsDAI(pwsDAI)
            setPendingWithdrawalsRest(pwsRest)
          })
        }
      })
    }
  }, [ensAddress])

  return React.createElement(PresentationalComponent, {
    hostname,
    ensAddress,
    resolvedAddress,
    address,
    pendingWithdrawalsExist,
    pendingWithdrawalsETH,
    pendingWithdrawalsDAI,
    pendingWithdrawalsRest,
    priceOfETHInUSD,
    onChangeTab
  })
}

const mapStateToProps = state => ({
  target: state.target,
  address: state.wallet.addresses[state.wallet.defaultAccount]
})
const mapDispatchToProps = dispatch => ({
  onChangeTarget: h => dispatch(setTarget(h))
})
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PageProfile)
