import React from 'react'
import { makeStyles } from '@material-ui/styles'
import Dialog from '@material-ui/core/Dialog'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import CircularProgress from '@material-ui/core/CircularProgress';

const useStyles = makeStyles(theme => ({
  buttonProgress: {
    position: 'absolute',
  },
}));

function AddTokenModal({ open, onClose, tokenAddr, onChangeTokenAddr, error, loading, onClickAdd, onClickCancel }) {
  const classes = useStyles()

  return (
    <div>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
      >
        <DialogTitle>Add Token</DialogTitle>
        <DialogContent>
          <TextField
            label={"Address of token"}
            onChange={event => onChangeTokenAddr(event.target.value)}
            value={tokenAddr}
            error={error}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={onClickCancel}
          >
            Cancel
          </Button>
          <Button
            onClick={onClickAdd}
            disabled={loading}
          >
            Add
            {loading && <CircularProgress size={24} className={classes.buttonProgress}/>}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default AddTokenModal
