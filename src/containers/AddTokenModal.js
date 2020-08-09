import React from 'react'
import { connect } from 'react-redux'
import PresentationalComponent from '../components/AddTokenModal'
import { addToken, removeToken } from '../actions'
import { getTokenName, getTokenSymbol } from '../api/blockchain'
import web3js from '../api/web3js'

function AddTokenModal({ open, onClose, ...mapped }) {
  const [tokenAddr, setTokenAddr] = React.useState('')
  const [error, setError] = React.useState(false)
  const [loading, setLoading] = React.useState(false)

  const resetState = () => {
    setTokenAddr('')
    setError(false)
  }

  const handleClickAdd = () => {
    if (web3js.utils.isAddress(tokenAddr)) {
      setError(false)
      setLoading(true)
      Promise.all([
        getTokenSymbol(tokenAddr),
        getTokenName(tokenAddr)
      ])
      .then(([symbol, name]) => {
        mapped.addToken(tokenAddr, symbol, name)
        onClose()
        setTokenAddr('')
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
    } else {
      setError(true)
    }
  }

  const handleClickCancel = () => {
    onClose()
    resetState()
  }

  return React.createElement(PresentationalComponent, {
    open,
    onClose,
    tokenAddr,
    onChangeTokenAddr: setTokenAddr,
    error,
    loading,
    onClickAdd: handleClickAdd,
    onClickCancel: handleClickCancel
  })
}

const mapStateToProps = state => ({

})

const mapDispatchToProps = dispatch => ({
  // old - not going into 1.0: addToken: tokenAddr => dispatch(addToken(tokenAddr))
  addToken: (address, symbol, name) => {
    dispatch(removeToken(address))
    dispatch(addToken(address, symbol, name))
  },
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AddTokenModal)
