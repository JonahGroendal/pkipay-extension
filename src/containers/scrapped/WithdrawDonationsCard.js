import React from 'react'
import { connect } from 'react-redux'
import PresentationalComponent from '../components/WithdrawDonationsCard'
import { createTxWithdrawAll } from '../api/blockchain'
import { reviewTx } from '../actions'

function WithdrawDonationsCard({ domainName, ...mapped }) {
  async function handleWithdrawl() {
    const { txObjects, daiValue, ethValue } = await createTxWithdrawAll(mapped.address, domainName)
    const value = {}
    if (daiValue > 0)
      value.DAI = daiValue
    if (ethValue > 0)
      value.ETH = ethValue
    mapped.onReviewTx(
      txObjects,
      [domainName],
      [value]
    )
  }

  return React.createElement(PresentationalComponent, {
    onClick: handleWithdrawl
  })
}

const mapStateToProps = state => ({
  address: state.wallet.addresses[state.wallet.defaultAccount]
})

const mapDispatchToProps = dispatch => ({
  onReviewTx: (txObjects, counterparties, values) => dispatch(reviewTx(txObjects, counterparties, values)),
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(WithdrawDonationsCard)
