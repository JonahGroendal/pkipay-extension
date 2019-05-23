import React from 'react'
import FullScreenDialog from './FullScreenDialog'
import Typography from '@material-ui/core/Typography'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import { getNewNonce, postNewAccount } from '../api/acme'

function ClaimWebsiteScreen({ open, onClose }) {
  const [certText, setCertText] = React.useState('')
  const [keyText, setKeyText] = React.useState('')

  // React.useEffect(() => {
  //   newNonce().then(console.log)
  // }, [])

  return (
    <FullScreenDialog
      title={"Claim Site Ownership"}
      open={open}
      onClose={onClose}
    >
      <div>
        <Typography type="subtitle1">
          Claim your website.
        </Typography>
        <Typography type="subtitle1">
          1. Obtain an SSL Certificate from LetsEncrypt
            a) If you have server access:
              i. Install LetsEncrypt's Certbot tool on your server https://certbot.eff.org
          https://certbot.eff.org/docs/using.html#getting-certificates-and-choosing-plugins
        </Typography>

        <TextField
          label="Certificate Data"
          multiline={true}
          rows={5}
          onChange={(e) => setCertText(e.target.value)}
        />
        <TextField
          label="Key Data"
          multiline={true}
          rows={5}
          onChange={(e) => setKeyText(e.target.value)}
        />
        <Button onClick={() => postNewAccount()}>
          Get nonce
        </Button>
      </div>
    </FullScreenDialog>
  )
}

export default ClaimWebsiteScreen
