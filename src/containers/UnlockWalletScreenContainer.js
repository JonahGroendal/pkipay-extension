import React from 'react'
import { connect } from 'react-redux'
import UnlockWalletScreen from '../components/UnlockWalletScreen'
import { unlockWallet, unlockWalletCancel, closeTx } from '../actions'

function UnlockWalletScreenContainer({ isOpen, isError, onUnlock, onClose }) {
  const [value, setValue] = React.useState('')

  function onChange(event) {
    setValue(event.target.value)
  }
  function onSubmit(event) {
    event.preventDefault()
    onUnlock(value)
  }

  return React.createElement(UnlockWalletScreen, {isOpen, isError, onSubmit, onChange, onClose })
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
