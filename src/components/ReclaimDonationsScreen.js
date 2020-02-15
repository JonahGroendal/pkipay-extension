import React from 'react'
import FullScreenDialog from './FullScreenDialog'
import { makeStyles } from '@material-ui/styles'
import Tooltip from '@material-ui/core/Tooltip'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import { truncateForDisplay } from '../api/utils'

const useStyles = makeStyles(theme => ({
  contentRoot: {
    marginTop: theme.spacing(2),
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2)
  },
  button: {
    marginTop: theme.spacing(2)
  }
}));

function ReclaimDonationsScreen({ open, onClose, onClickReclaim, donation }) {
  const { doneeName, balance, tokenSymbol } = donation ? donation : {}
  const classes = useStyles()

  const displayName = !!doneeName && truncateForDisplay(doneeName, 23)
  const amount = !!balance && balance.toFixed(2)
  return (
    <FullScreenDialog
      title={displayName}
      open={open}
      onClose={onClose}
    >
      <div className={classes.contentRoot}>
        <Typography>
          {`You have donated a total of ${amount} ${tokenSymbol} to
          ${displayName}. Since the recipient hasn't signed up yet, you may
          reclaim your donations for a full refund.`}
        </Typography>
        <Button
          className={classes.button}
          onClick={() => {onClose(); onClickReclaim()}}
          variant="contained" size="medium" color="primary"
        >
          {`Reclaim ${amount} ${tokenSymbol}`}
        </Button>
      </div>
    </FullScreenDialog>
  )
}

export default ReclaimDonationsScreen
