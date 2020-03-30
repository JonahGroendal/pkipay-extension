import React from 'react'
import QRCodeDisplay from './QRCodeDisplay'
import Dialog from '@material-ui/core/Dialog'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import Button from '@material-ui/core/Button'
import Snackbar from '@material-ui/core/Snackbar'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'
import Slide from '@material-ui/core/Slide'

function QRCodeScreen({ address, onCopy: handleCopy }) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);

  function handleCloseSnackbar(event, reason) {
    if (reason === 'clickaway') return;
    setSnackbarOpen(false);
  }

  function handleClickCopy() {
    handleCopy(address)
    setSnackbarOpen(true)
  }

  return (
    <div>
      <Button
        variant="outlined"
        size="small"
        onClick={() => setIsOpen(!isOpen)}
      >
        Add funds
      </Button>
      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        maxWidth="md"
      >
        <DialogTitle>Account Address</DialogTitle>
        <DialogContent>
          <QRCodeDisplay text={address}/>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleClickCopy}
          >
            Copy
          </Button>
          <Button
            onClick={() => setIsOpen(false)}
          >
            Close
          </Button>
        </DialogActions>
        <Snackbar
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={handleCloseSnackbar}
          ContentProps={{
            'aria-describedby': 'message-id',
          }}
          message={<span id="message-id">Copied to clipboard</span>}
          action={[
            <IconButton
              key="close"
              aria-label="Close"
              color="inherit"
              onClick={handleCloseSnackbar}
            >
              <CloseIcon />
            </IconButton>,
          ]}
          TransitionComponent={Slide}
        />
      </Dialog>
    </div>
  )
}

export default QRCodeScreen
