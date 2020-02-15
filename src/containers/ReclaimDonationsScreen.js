import React from 'react'
import { connect } from 'react-redux'
import PresentationalComponent from '../components/ReclaimDonationsScreen'
import { createTxReclaimDonations, createTxReclaimDonationsETH } from '../api/blockchain'
import { reviewTx } from '../actions'

function ReclaimDonationsScreen({ open, onClose, donation, address, onReviewTx }) {
  return React.createElement(PresentationalComponent, {
    open,
    onClose,
    donation,
    onClickReclaim: () => {
      const { donee, doneeName, token, tokenSymbol, balance } = donation
      console.log(donation)
      const ensNode = donee
      const tx = token === '0x0000000000000000000000000000000000000000'
        ? createTxReclaimDonationsETH(address, ensNode)
        : createTxReclaimDonations(address, ensNode, token)
      onReviewTx(tx, doneeName, tokenSymbol, balance)
    }
  })
}

const mapStateToProps = state => ({
  address: state.wallet.addresses[state.wallet.defaultAccount]
})

const mapDispatchToProps = dispatch => ({
  onReviewTx: async (tx, doneeName, tokenSymbol, amount) => {
    dispatch(reviewTx([tx], [doneeName], [{ [tokenSymbol]: amount }]))
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(ReclaimDonationsScreen)
