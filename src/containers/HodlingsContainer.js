import React from 'react';
import { connect } from 'react-redux'
import Hodlings from '../components/Hodlings'
import strings from '../api/strings'
import { getTokenBalances } from '../api/blockchain'
import convertUSD from '../api/ECBForexRates'
import { removeToken } from '../actions'

function HodlingsContainer({ currency, address, names, txScreenOpen, onRemoveToken }) {
  const balances = useBalances(address, names, txScreenOpen, onRemoveToken)
  const currencySymbol = strings.currency[currency]
  let displayedBalances = []
  balances.forEach(balance => {
    balance.balance = convertUSD(currency, balance.balance)
    displayedBalances.push(balance)
  })
  console.log("rendering!")
  return React.createElement(Hodlings, { balances: displayedBalances, currencySymbol })
}

function useBalances(address, names, txScreenOpen, onRemoveToken) {
  const [balances, setBalances] = React.useState([])

  React.useEffect(() => {
    if (!txScreenOpen) {
      getTokenBalances(address, names).then(balances => {
        setBalances(balances, () => {
          balances.forEach(bal => {
            if (bal.balance === 0)
              onRemoveToken(bal.name)
          })
        })
      })
    }
  }, [txScreenOpen, address, names])

  return balances
}

const mapStateToProps = state => ({
  currency: state.settings.currency,
  address: state.wallet.addresses[0],
  names: state.wallet.tokens,
  txScreenOpen: state.transactionScreen.isOpen
})
const mapDispatchToProps = dispatch => ({
  onRemoveToken: name => dispatch(removeToken(name))
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(HodlingsContainer)
