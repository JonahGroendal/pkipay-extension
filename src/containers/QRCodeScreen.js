import React from 'react'
import { connect } from 'react-redux'
import PresentationalComponent from '../components/QRCodeScreen'

function QRCodeScreen({ address }) {
  function handleCopy(text) {
    navigator.clipboard.writeText(text)
  }

  return React.createElement(PresentationalComponent, {
    address,
    onCopy: handleCopy
  })
}

const mapStateToProps = state => ({
  address: state.wallet.addresses[state.wallet.defaultAccount]
})

export default connect(mapStateToProps)(QRCodeScreen)
