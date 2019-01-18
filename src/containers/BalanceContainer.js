import React from 'react'
import { connect } from 'react-redux'
import Balance from '../components/Balance'
import blockchain from '../api/blockchain'
import strings from '../api/strings'
import convertUSD from '../api/ECBForexRates.js'

function BalanceContainer({ address, currency }) {

  const [balance, setBalance] = React.useState(null);

  function handleChange(newDaiBalance) {
    setBalance(convertUSD(currency, parseFloat(newDaiBalance)/(10**18)));
  }
  // Fetch initial balance
  React.useEffect(async () => {
    if (address)
      blockchain.getDaiBalance(address).then(handleChange);
  }, [address]);
  // Fetch balance whenever it changes
  React.useEffect(() => {
    if (address)
      return blockchain.subscribeToDaiTransfer(address, handleChange);
  }, [address]);

  const currencySymbol = strings.currency[currency];

  return React.createElement(Balance, {balance, currencySymbol})
}

const mapStateToProps = state => ({
  address: state.wallet.addresses[0],
  currency: state.settings.currency,
})
export default connect(mapStateToProps)(BalanceContainer)
