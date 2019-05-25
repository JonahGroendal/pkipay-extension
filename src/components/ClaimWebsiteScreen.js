import React from 'react'
import FullScreenDialog from './FullScreenDialog'
import Typography from '@material-ui/core/Typography'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import acme from '../api/acme'

function ClaimWebsiteScreen({ open, onClose }) {
  const [serializedJwk, setSerializedJwk] = React.useState('')
  const [serializedOrder, setSerializedOrder] = React.useState('')

  function jwk() {
    return JSON.parse(serializedJwk)
  }

  return (
    <FullScreenDialog
      title={"Claim Site Ownership"}
      open={open}
      onClose={onClose}
    >
      <div>
        <Button onClick={() => acme.generateJwk().then(jwk => setSerializedJwk(JSON.stringify(jwk)))}>
          generateJwk
        </Button>
        <Button onClick={() => console.log(jwk())}>
          check jwk
        </Button>
        <Button onClick={() => acme.postNewAccount(jwk()).then(a => acme.postNewOrder(jwk(), 'pkipay.net', a)).then(v => setSerializedOrder(JSON.stringify(v.order)))}>
          postNewAccount then postNewOrder
        </Button>
        <Button onClick={() => acme.postOrderChallenge(jwk(), JSON.parse(serializedOrder))}>
          postOrderChallenge
        </Button>
        <Button onClick={() => acme.postOrderFinalize(jwk(), JSON.parse(serializedOrder))}>
          postOrderFinalize
        </Button>
      </div>
    </FullScreenDialog>
  )
}

export default ClaimWebsiteScreen
