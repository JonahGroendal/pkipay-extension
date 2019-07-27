import React from 'react'
import { makeStyles } from '@material-ui/styles'
import FullScreenDialog from './FullScreenDialog'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Page from './Page'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'

const useStyles = makeStyles(theme => ({
  root: {
    paddingTop: theme.spacing(2),
    paddingRight: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    paddingLeft: theme.spacing(2),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  textField: {
    marginTop: theme.spacing(2),
    marginBottom: 0
  },
  spacer: {
    height: theme.spacing(6)
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: theme.spacing(2),
  }
}));

function CreatePasswordScreen(props) {
  const {
    isOpen,
    pwError,
    onClickCreate,
    pw1,
    pw2,
    onChangePw1,
    onChangePw2
  } = props
  const classes = useStyles()

  return (
    <FullScreenDialog
      title="Account Setup"
      open={isOpen}
      hideClose={true}
    >
      <div className={classes.root}>
        <Typography align="center" variant="h6">
          Create a Password
        </Typography>
        <Typography align="center">
          Choose a strong password that you will remember. If you forget it
          you cannot recover your funds.
        </Typography>
        <TextField
          className={classes.textField}
          onChange={onChangePw1}
          value={pw1}
          label="Password"
          type="password"
          margin="normal"
        />
        <TextField
          className={classes.textField}
          onChange={onChangePw2}
          value={pw2}
          error={pwError}
          helperText={pwError ? 'Passwords must match' : ''}
          label="Retype password"
          type="password"
          margin="normal"
        />
        <div className={classes.spacer} />
        <Button
          onClick={onClickCreate}
          fullWidth={true}
          variant="contained" color="secondary"
        >
          Create Account
        </Button>
      </div>
    </FullScreenDialog>
  )
}

export default CreatePasswordScreen
