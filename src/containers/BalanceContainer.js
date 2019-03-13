import React from 'react'
import { connect } from 'react-redux'
import Balance from '../components/Balance'
import blockchain from '../api/blockchain'
import strings from '../api/strings'
import { convertFromUSD } from '../api/ECBForexRates.js'

function BalanceContainer({ address, currency, txScreenOpen }) {

  const [balance, setBalance] = React.useState(null)
  const currencySymbol = strings.currency[currency]

  React.useEffect(() => {
    if (address && !txScreenOpen)
      blockchain.getCurrencyBalance(address).then(setBalance);
  }, [address, txScreenOpen]);

  return React.createElement(Balance, {
    balance: convertFromUSD(currency, balance),
    currencySymbol
  })
}

const mapStateToProps = state => ({
  address: state.wallet.addresses[0],
  currency: state.settings.currency,
  txScreenOpen: state.transactionScreen.isOpen
})
export default connect(mapStateToProps)(BalanceContainer)
