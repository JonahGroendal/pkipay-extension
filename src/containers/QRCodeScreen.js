import React from 'react'
import { connect } from 'react-redux'
import PresentationalComponent from '../components/QRCodeScreen'

function QRCodeScreen({ open, onClose, address }) {
  function handleCopy(text) {
    navigator.clipboard.writeText(text)
  }

  return React.createElement(PresentationalComponent, {
    open,
    onClose,
    address,
    onCopy: handleCopy
  })
}

const mapStateToProps = state => ({
  address: state.wallet.addresses[state.wallet.defaultAccount]
})

export default connect(mapStateToProps)(QRCodeScreen)
