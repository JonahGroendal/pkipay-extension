import React from 'react'
import { connect } from 'react-redux'
import PresentationalComponent from '../components/PageManage'
import { getBalanceETH } from '../api/blockchain'

function PageManage({ priceOfETHInUSD, onChangeTab, inView, ...mapped }) {
  const [ethBalance, setEthBalance] = React.useState(0)

  React.useEffect(() => {
    if (!ethBalance && mapped.address && inView)
      getBalanceETH(mapped.address).then(setEthBalance)
  }, [mapped.address, inView])

  React.useEffect(() => {
    if (ethBalance && !mapped.txScreenOpen)
      getBalanceETH(mapped.address).then(setEthBalance)
  }, [mapped.txScreenOpen])

  return React.createElement(PresentationalComponent, {
    priceOfETHInUSD,
    onChangeTab,
    ethBalance,
    inView
  })
}

const mapStateToProps = state => ({
  address: state.wallet.addresses[state.wallet.defaultAccount],
  txScreenOpen: state.transactionScreen.isOpen
})
export default connect(mapStateToProps)(PageManage)
