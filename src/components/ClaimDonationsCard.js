import React from 'react'
import { makeStyles } from '@material-ui/styles'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button'
import Tooltip from '@material-ui/core/Tooltip'

const useStyles = makeStyles(theme => ({
  paper: {
    paddingTop: theme.spacing(2),
    paddingRight: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    paddingLeft: theme.spacing(2),
  },
  details: {
    paddingTop: theme.spacing(1)
  },
  buttonRow: {
    display: 'flex',
    justifyContent: 'right'
  }
}));

function ClaimWebsiteCard(props) {
  const {
    onClickButton,
    pendingWithdrawalsExist,
    pendingWithdrawalsETH,
    pendingWithdrawalsDAI,
    pendingWithdrawalsRest
  } = props

  const classes = useStyles()

  const pwETH = pendingWithdrawalsETH
  const pwDAI = pendingWithdrawalsDAI
  const pwRest = pendingWithdrawalsRest
  return (
    <div>
      <Paper className={classes.paper}>
        <Typography variant="h6">
          Escrowed donations
        </Typography>
        <Typography variant="body2">
          This site is unregistered and has donations held in escrow.
        </Typography>
        <div className={classes.details}>
          <Typography>
            {'ETH: '.concat(pwETH.toFixed(3))}
          </Typography>
          <Typography>
            {'DAI: '.concat(pwDAI.toFixed(3))}
          </Typography>
          <Typography>
            {'Other tokens: '.concat(pwRest.toFixed(3))}
          </Typography>
        </div>
        <Tooltip title={'Register ownership of this site and claim donations'} enterDelay={300}>
          <div className={classes.buttonRow}>
            <Button
              onClick={onClickButton}
              variant="contained" size="medium" color="primary"
            >
              Claim
            </Button>
          </div>
        </Tooltip>
      </Paper>
    </div>
  )
}

export default ClaimWebsiteCard;
