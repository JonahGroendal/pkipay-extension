import React from 'react'
import FullScreenDialog from './FullScreenDialog'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'

const CreateWalletScreen = ({
  isOpen,
  pwError,
  privKeyError,
  onSubmit,
  onChangeEmail,
  onChangePw1,
  onChangePw2,
  onChangePrivKey,
  submitBtnText,
}) => (
  <FullScreenDialog
    title="Create wallet"
    open={isOpen}
    hideClose={true}
  >
    <form onSubmit={onSubmit}>
      <TextField
        onChange={onChangeEmail}
        label="Recovery email"
        type="email"
        margin="normal"
      />
      <TextField
        onChange={onChangePw1}
        error={pwError}
        label="Create password"
        type="password"
        margin="normal"
      />
      <TextField
        onChange={onChangePw2}
        error={pwError}
        label="Retype password"
        type="password"
        margin="normal"
      />
      <Typography variant="subtitle1">
        {'optionally, import an existing account:'}
      </Typography>
      <TextField
        onChange={onChangePrivKey}
        error={privKeyError}
        label="Private key"
        margin="normal"
      />
      <Button
        type="submit"
        variant="outlined" size="medium" color="secondary"
      >
        {submitBtnText}
      </Button>
    </form>
  </FullScreenDialog>
)

export default CreateWalletScreen
