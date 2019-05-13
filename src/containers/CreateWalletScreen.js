import React from 'react'
import { connect } from 'react-redux'
import PresentationalComponent from '../components/CreateWalletScreen'
import { createWallet, addAccount } from '../actions'

function CreateWalletScreen({ isOpen, onCreate, onAdd }) {
  const [pw1, setPw1] = React.useState('')
  const [pw2, setPw2] = React.useState('')
  const [privKey, setPrivKey] = React.useState('0x17ff09f56c1235b968b61ff12500b97b04b929a7c68cc66357df4b42a8bf50dd')//0xd3adcdbf12b4d79dfc05434d25b32fcc12d264a5be4eabddb1ce7bb5305c0009
  const [pwError, setPwError] = React.useState(false)
  const [privKeyError, setPrivKeyError] = React.useState(false)

  function handleClickImport() {
    const isValid = key => (key.substring(0, 2) === '0x' && key.length === 66)
    setPrivKeyError(false)
    setPwError(false)
    if (pw1 !== pw2)
      setPwError(true)
    if (!isValid(privKey))
      setPrivKeyError(true)
    if (pw1 === pw2 && isValid(privKey)) {
      try { onAdd(privKey, pw1) }
      catch { setPrivKeyError(true) }
    }
  }
  function handleClickCreate() {
    if (pw1 === pw2) {
      setPwError(false)
      onCreate(pw1)
    } else {
      setPwError(true)
    }
  }

  return React.createElement(PresentationalComponent, {
    isOpen,
    pwError,
    privKeyError,
    pw1,
    pw2,
    privKey,
    onChangePw1: (event) => setPw1(event.target.value),
    onChangePw2: (event) => setPw2(event.target.value),
    onChangePrivKey: (event) => setPrivKey(event.target.value),
    onClickCreate: handleClickCreate,
    onClickImport: handleClickImport,
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
)(CreateWalletScreen)
