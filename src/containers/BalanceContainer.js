import React from 'react'
import { connect } from 'react-redux'
import Balance from '../components/Balance'
import blockchain from '../api/blockchain'
import strings from '../api/strings'
import convertUSD from '../api/ECBForexRates.js'

function BalanceContainer({ address, currency, txScreenOpen }) {

  const [balance, setBalance] = React.useState(null);

  function handleChange(newDaiBalance) {
    setBalance(convertUSD(currency, parseFloat(newDaiBalance)/(10**18)));
  }
  // Fetch initial balance
  React.useEffect(() => {
    if (address && !txScreenOpen)
      blockchain.getDaiBalance(address).then(handleChange);
  }, [address, txScreenOpen]);

  const currencySymbol = strings.currency[currency];

  return React.createElement(Balance, {balance, currencySymbol})
}

const mapStateToProps = state => ({
  address: state.wallet.addresses[0],
  currency: state.settings.currency,
  txScreenOpen: state.transactionScreen.isOpen
})
export default connect(mapStateToProps)(BalanceContainer)
