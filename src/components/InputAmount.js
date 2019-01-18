import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import Button from '@material-ui/core/Button'
import Tooltip from '@material-ui/core/Tooltip'
import TextField from '@material-ui/core/TextField'
import InputAdornment from '@material-ui/core/InputAdornment'

const InputAmount = ({ amount, currencySymbol, onChange, onClick, buttonText, tooltip, classes }) => (
  <Paper className={classes.paper}>
    <div className={classes.container}>
      <TextField
        className={classes.textField}
        label="amount"
        onChange={onChange}
        value={amount}
        InputProps={{
          startAdornment: <InputAdornment position="start">{currencySymbol}</InputAdornment>,
          type: "number",
          step: ".01"
        }}
      />
      <Tooltip title={tooltip}>
        <Button
          onClick={onClick}
          variant="contained" size="medium" color="primary"
        >
          {buttonText}
        </Button>
      </Tooltip>
    </div>
  </Paper>
)

const styles = theme => ({
  paper: {
    paddingTop: theme.spacing.unit * 2,
    paddingRight: theme.spacing.unit * 2,
    paddingBottom: theme.spacing.unit * 2,
    paddingLeft: theme.spacing.unit * 2,
  },
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  textField: {
    width: theme.spacing.unit * 16
  },
});

export default withStyles(styles)(InputAmount);
