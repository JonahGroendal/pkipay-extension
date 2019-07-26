import React from 'react'
import { connect } from 'react-redux'
import PresentationalComponent from '../components/UnlockWalletScreen'
import { unlockWallet, unlockWalletCancel } from '../actions'

function UnlockWalletScreen({ isOpen, isError, onUnlock, onClose }) {
  const [value, setValue] = React.useState('')

  function handleChange(event) {
    setValue(event.target.value)
  }
  function handleSubmit() {
    onUnlock(value)
  }

  return React.createElement(PresentationalComponent, {
    isOpen,
    isError,
    onSubmit: handleSubmit,
    onChange: handleChange,
    onClose
  })
}

const mapStateToProps = state => ({
  isOpen: state.unlockWalletScreen.isOpen,
  isError: state.unlockWalletScreen.attempts > 0
})
const mapDispatchToProps = dispatch => ({
  onUnlock: password => dispatch(unlockWallet(password)),
  onClose: () => dispatch(unlockWalletCancel())
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(UnlockWalletScreen)
