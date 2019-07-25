import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import FullScreenDialog from './FullScreenDialog'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Page from './Page'
import Paper from '@material-ui/core/Paper'

const useStyles = makeStyles(theme => ({
  paper: {
    paddingRight: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    paddingLeft: theme.spacing(2)
  },
  textField: {
    marginTop: theme.spacing(2),
    marginBottom: 0
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: theme.spacing(2)
  }
}));

function CreateWalletScreen(props) {
  const {
    isOpen,
    pwError,
    privKeyError,
    onClickCreate,
    onClickImport,
    pw1,
    onChangePw1,
    pw2,
    onChangePw2,
    privKey,
    onChangePrivKey
  } = props
  const classes = useStyles()

  return (
    <FullScreenDialog
      title="Create or Import Wallet"
      open={isOpen}
      hideClose={true}
    >
      <Page>
        <Paper className={classes.paper}>
          <TextField
            className={classes.textField}
            onChange={onChangePw1}
            value={pw1}
            error={pwError}
            label="Create password"
            type="password"
            margin="normal"
          />
          <TextField
            className={classes.textField}
            onChange={onChangePw2}
            value={pw2}
            error={pwError}
            label="Retype password"
            type="password"
            margin="normal"
          />
          <div className={classes.buttonContainer}>
            <Button
              onClick={onClickCreate}
              variant="outlined" size="medium" color="secondary"
            >
              Create wallet
            </Button>
          </div>
        </Paper>
        <Paper className={classes.paper}>
          <TextField
            className={classes.textField}
            onChange={onChangePw1}
            value={pw1}
            error={pwError}
            label="Create password"
            type="password"
            margin="normal"
          />
          <TextField
            className={classes.textField}
            onChange={onChangePw2}
            value={pw2}
            error={pwError}
            label="Retype password"
            type="password"
            margin="normal"
          />
          <TextField
            className={classes.textField}
            onChange={onChangePrivKey}
            value={privKey}
            error={privKeyError}
            label="Private key"
            margin="normal"
            fullWidth={true}
          />
          <div className={classes.buttonContainer}>
            <Button
              onClick={onClickImport}
              variant="outlined" size="medium" color="secondary"
            >
              Import wallet
            </Button>
          </div>
        </Paper>
      </Page>
    </FullScreenDialog>
  )
}

export default CreateWalletScreen
