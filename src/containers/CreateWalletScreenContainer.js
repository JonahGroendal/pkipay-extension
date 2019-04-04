import React from 'react'
import { connect } from 'react-redux'
import CreateWalletScreen from '../components/CreateWalletScreen'
import { createWallet, addAccount } from '../actions'

function CreateWalletScreenContainer({ isOpen, onCreate, onAdd }) {
  const [email, setEmail] = React.useState('')
  const [pw1, setPw1] = React.useState('')
  const [pw2, setPw2] = React.useState('')
  const [privKey, setPrivKey] = React.useState('0xd3adcdbf12b4d79dfc05434d25b32fcc12d264a5be4eabddb1ce7bb5305c0009')
  const [pwError, setPwError] = React.useState(false)

  function onChangeEmail(event) { setEmail(event.target.value) }
  function onChangePw1(event) { setPw1(event.target.value) }
  function onChangePw2(event) { setPw2(event.target.value) }
  function onChangePrivKey(event) { setPrivKey(event.target.value)}

  function onSubmit(event) {
    event.preventDefault()
    if (pw1 === pw2) {
      if (privKey !== '') {
        onAdd(privKey, pw1)
      } else {
        setPwError(false)
        onCreate(pw1)
      }
    } else {
      setPwError(true)
    }
  }

  return React.createElement(CreateWalletScreen, {
    isOpen,
    pwError,
    onSubmit,
    onChangeEmail,
    onChangePw1,
    onChangePw2,
    onChangePrivKey,
    submitBtnText: privKey === '' ? "Create" : "Import"
  })
}

const mapStateToProps = state => ({
  isOpen: state.wallet.addresses.length === 0
})
const mapDispatchToProps = dispatch => ({
  onCreate: password => dispatch(createWallet(password)),
  onAdd: (privateKey, password) => dispatch(addAccount(privateKey, password))
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CreateWalletScreenContainer)
