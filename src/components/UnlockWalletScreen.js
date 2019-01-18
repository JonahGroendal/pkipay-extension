import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import FullScreenDialog from './FullScreenDialog'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'

const UnlockWalletScreen = ({ isOpen, isError, onSubmit, onChange, onClose, classes }) => (
  <FullScreenDialog
    className={classes.root}
    title="Unlock wallet"
    open={isOpen}
    onClose={onClose}
  >
    <form onSubmit={onSubmit}>
      <TextField
        onChange={onChange}
        error={isError}
        label="Password"
        type="password"
        margin="normal"
      />
      <Button
        type="submit"
        variant="outlined" size="medium" color="secondary"
      >
        Unlock
      </Button>
    </form>
  </FullScreenDialog>
)

const styles = theme => ({
  root: {
    zIndex: 100
  }
})

export default withStyles(styles)(UnlockWalletScreen)
