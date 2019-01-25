import React from 'react'
import { connect } from 'react-redux'
import UnlockWalletScreen from '../components/UnlockWalletScreen'
import { unlockWallet, unlockWalletCancel, closeTx } from '../actions'

function UnlockWalletScreenContainer({ isOpen, isError, onUnlock, onClose }) {
  const [value, setValue] = React.useState('')

  function handleChange(event) {
    setValue(event.target.value)
  }
  function handleSubmit() {
    onUnlock(value)
  }

  return React.createElement(UnlockWalletScreen, {
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
  onClose: () => {
    dispatch(closeTx())
    dispatch(unlockWalletCancel())
  }
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(UnlockWalletScreenContainer)
