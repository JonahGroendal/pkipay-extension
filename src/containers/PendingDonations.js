import React from 'react'
import { connect } from 'react-redux'
import PresentationalComponent from '../components/PendingDonations'
import { getPendingDonations, getTokenSymbol } from '../api/blockchain'
import namehash from 'eth-ens-namehash'

function PendingDonations({ ...mapped }) {
  const pendingDonations = useDonationEscrowBalances(mapped.address, mapped.txScreenOpen, mapped.tabIndex, mapped.counterparties)

  return React.createElement(PresentationalComponent, {
    pendingDonations
  })
}

const mapStateToProps = state => ({
  address: state.wallet.addresses[state.wallet.defaultAccount],
  txScreenOpen: state.transactionScreen.isOpen,
  tabIndex: state.pages.tabIndex,
  counterparties: state.wallet.counterparties
})

export default connect(mapStateToProps)(PendingDonations)

function useDonationEscrowBalances(from, txScreenOpen, tabIndex, ensDomains) {
  const [balances, setBalances] = React.useState([])
  const [tokenSymbols, setTokenSymbols] = React.useState({})
  React.useEffect(() => {
    if (from && !txScreenOpen && tabIndex === 1) {
      const ensNodes = {}
      ensDomains.forEach(token => {
        ensNodes[namehash.hash(token)] = token
      })
      getPendingDonations(from)
      .then(pendingDonations => {
        const tempTokenSymbols = { ...tokenSymbols }
        Promise.all(pendingDonations.map(pd => {
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
  }, [from, txScreenOpen, tabIndex])
  return balances
}
