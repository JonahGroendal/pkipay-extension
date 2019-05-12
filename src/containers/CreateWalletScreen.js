import React from 'react'
import { connect } from 'react-redux'
import PresentationalComponent from '../components/CreateWalletScreen'
import { createWallet, addAccount } from '../actions'

function CreateWalletScreen({ isOpen, onCreate, onAdd }) {
  const [pw1, setPw1] = React.useState('')
  const [pw2, setPw2] = React.useState('')
  const [privKey, setPrivKey] = React.useState('0x17ff09f56c1235b968b61ff12500b97b04b929a7c68cc66357df4b42a8bf50dd')//0xd3adcdbf12b4d79dfc05434d25b32fcc12d264a5be4eabddb1ce7bb5305c0009
  const [pwError, setPwError] = React.useState(false)

  return React.createElement(PresentationalComponent, {
    isOpen,
    pwError,
    pw1,
    pw2,
    privKey,
    onChangePw1: (event) => setPw1(event.target.value),
    onChangePw2: (event) => setPw2(event.target.value),
    onChangePrivKey: (event) => setPrivKey(event.target.value),
    onClickCreate: () => {
      if (pw1 === pw2) {
        setPwError(false)
        onCreate(pw1)
      } else {
        setPwError(true)
      }
    },
    onClickImport: () => {
      if (pw1 === pw2) {
        setPwError(false)
        onAdd(privKey, pw1)
      } else {
        setPwError(true)
      }
    },
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
)(CreateWalletScreen)
