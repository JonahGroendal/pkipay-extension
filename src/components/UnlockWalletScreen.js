import React from 'react'
import Dialog from '@material-ui/core/Dialog'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'

const UnlockWalletScreen = ({ isOpen, isError, onSubmit, onChange, onClose, classes }) => (
  <Dialog
    open={isOpen}
    onClose={onClose}
    maxWidth="md"
    aria-labelledby="unlock-wallet-title"
  >
    <DialogTitle id="unlock-wallet-title">Unlock wallet</DialogTitle>
    <DialogContent>
      <TextField
        onChange={onChange}
        error={isError}
        label="Password"
        type="password"
        autoFocus={true}
        onKeyPress={e => {
          if (e.key === 'Enter') {
            onSubmit();
            e.preventDefault();
          }
        }}
      />
    </DialogContent>
    <DialogActions>
      <Button
        onClick={onClose}
        color="secondary"
      >
        Cancel
      </Button>
      <Button
        onClick={onSubmit}
        color="secondary"
      >
        Unlock
      </Button>
    </DialogActions>
  </Dialog>
)

export default UnlockWalletScreen
