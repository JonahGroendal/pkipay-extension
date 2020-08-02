import React from 'react'
import { connect } from 'react-redux'
import PresentationalComponent from '../components/AccountCard'
import { navigateTo } from '../api/browser'
import currencySymbols from '../api/currencySymbols'
import { convertFromUSD } from '../api/ECBForexRates'

const toQueryParams = paramsObj => (
  Object.entries(paramsObj).map(([key, val]) => key.concat('=', val)).join('&')
)

function AccountCard({ onClickSend, onClickAccount, priceOfETHInUSD, ethBalance, ...mapped }) {
  const handleClickBuy = async () => {
    if (mapped.address) {
      const queryParams = toQueryParams({
        dest: mapped.address,
        destCurrency: 'ETH',
        paymentMethod: 'debit-card',
      })
      try {
        await navigateTo('https://pay.sendwyre.com/purchase?'.concat(queryParams))
      } catch (error) {
        console.error(error)
      }
    }
  }

  return React.createElement(PresentationalComponent, {
    ethBalance,
    onClickSend,
    onClickAccount,
    onClickBuy: handleClickBuy,
    address: mapped.address ? mapped.address : '',
    ethBalanceInCurrency: convertFromUSD(mapped.currency, priceOfETHInUSD * ethBalance),
    currencySymbol: currencySymbols[mapped.currency],
  })
}

const mapStateToProps = state => ({
  address: state.wallet.addresses[state.wallet.defaultAccount],
  currency: state.settings['Currency'],
  txScreenOpen: state.transactionScreen.isOpen
})

export default connect(mapStateToProps)(AccountCard)
