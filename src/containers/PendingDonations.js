import React from 'react'
import { connect } from 'react-redux'
import PresentationalComponent from '../components/PendingDonations'
import { getPendingDonations, getTokenSymbol, domainNameToEnsName } from '../api/blockchain'
import { addCounterparty, removeCounterparty } from '../actions'
import namehash from 'eth-ens-namehash'
import { isDomainName } from '../api/utils'

function PendingDonations({ inView=true, ...mapped }) {
  const pendingDonations = useDonationEscrowBalances(mapped.address, mapped.txScreenOpen, inView, mapped.counterparties)

  // If donees are found that don't exist in the `counterparties` array, add them
  React.useEffect(() => {
    pendingDonations.forEach(pd => {
      if (!mapped.counterparties.includes(pd.doneeName)) {
        mapped.addCounterparty(pd.doneeName)
      }
    })
  }, [pendingDonations])

  // In case the ENS names of some couterparties are not known (but only its namehash is
  // known) this method will check if the current target is a counterparty and,
  // if so, will replace the known ENS node with the ENS name
  React.useEffect(() => {
    if (mapped.target && isDomainName(mapped.target)) {
      const ensName = domainNameToEnsName(mapped.target.split('.').slice(-2).join('.'))
      const ensNode = namehash.hash(ensName)
      if (mapped.counterparties.includes(ensNode)) {
        mapped.addCounterparty(ensName)
        mapped.removeCounterparty(ensNode)
      }
    }
  }, [mapped.target, mapped.counterparties])

  return React.createElement(PresentationalComponent, {
    pendingDonations
  })
}

const mapStateToProps = state => ({
  address: state.wallet.addresses[state.wallet.defaultAccount],
  txScreenOpen: state.transactionScreen.isOpen,
  counterparties: state.wallet.counterparties,
  target: state.target
})

const mapDispatchToProps = dispatch => ({
  addCounterparty: ensAddress => dispatch(addCounterparty(ensAddress)),
  removeCounterparty: ensAddress => dispatch(removeCounterparty(ensAddress))
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PendingDonations)

function useDonationEscrowBalances(from, txScreenOpen, inView, ensDomains) {
  const [balances, setBalances] = React.useState([])
  const [tokenSymbols, setTokenSymbols] = React.useState({})
  const [initialized, setInitialized] = React.useState(false)

  const doAllTheStuff = async () => {
    const ensNodes = {}
    ensDomains.forEach(token => {
      ensNodes[namehash.hash(token)] = token
    })
    return getPendingDonations(from)
    .then(pendingDonations => {
      const tempTokenSymbols = { ...tokenSymbols }
      return Promise.all(pendingDonations.map(pd => {
        if(!Object.keys(tempTokenSymbols).includes(pd.token))
          tempTokenSymbols[pd.token] = getTokenSymbol(pd.token)
        return tempTokenSymbols[pd.token]
      }))
      .then((tokenSymbols, index) => {
        setBalances(pendingDonations.map((pd, i) => {
          if (tokenSymbols[i] !== undefined)
            pd.tokenSymbol = tokenSymbols[i]
          else if (pd.token === '0x0000000000000000000000000000000000000000')
            pd.tokenSymbol = 'ETH'
          else
            pd.tokenSymbol = pd.token
          pd.doneeName = ensNodes[pd.donee] ? ensNodes[pd.donee] : pd.donee
          return pd
        }))
        setTokenSymbols(tempTokenSymbols)
      })
    })
  }

  React.useEffect(() => {
    if (!initialized && from && inView) {
      doAllTheStuff()
      .then(() => setInitialized(true))
    }
  }, [from, inView])

  React.useEffect(() => {
    if (initialized && from && !txScreenOpen) {
      doAllTheStuff()
    }
  }, [from, txScreenOpen])

  return balances
}
