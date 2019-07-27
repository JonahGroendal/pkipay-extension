import React from 'react'
import { connect } from 'react-redux'
import PresentationalComponent from '../components/CreatePasswordScreen'
import { createWallet, addAccount } from '../actions'

function CreatePasswordScreen({ isOpen, onCreate, onAdd }) {
  const [pw1, setPw1] = React.useState('')
  const [pw2, setPw2] = React.useState('')
  const [pwError, setPwError] = React.useState(false)

  function handleClickCreate() {
    if (pw1 === pw2) {
      setPwError(false)
      if (process.env.REACT_APP_ACTUAL_ENV === 'production')
        onCreate(pw1)
      else
        onAdd('0x17ff09f56c1235b968b61ff12500b97b04b929a7c68cc66357df4b42a8bf50dd', pw1)
    } else {
      setPwError(true)
    }
  }

  return React.createElement(PresentationalComponent, {
    isOpen,
    pwError,
    pw1,
    pw2,
    onChangePw1: (event) => setPw1(event.target.value),
    onChangePw2: (event) => setPw2(event.target.value),
    onClickCreate: handleClickCreate,
  })
}

const mapStateToProps = state => ({
  isOpen: state.wallet.addresses.length === 0
})
const mapDispatchToProps = dispatch => ({
  onCreate: password => dispatch(createWallet(password)),
  onAdd: (privKey, password) => dispatch(addAccount(privKey, password))
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CreatePasswordScreen)
