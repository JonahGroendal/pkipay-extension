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
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  }
}));

function ClaimWebsiteCard({ onClickButton, alreadyClaimed }) {
  const classes = useStyles()

  return (
    <div>
      <Paper className={classes.paper}>
        <div className={classes.container}>
          <Typography variant="subtitle1">
            Is this your site?
          </Typography>
          <Tooltip title={'Claim ownership of this site'} enterDelay={300}>
            <div>
              <Button
                onClick={onClickButton}
                variant="contained" size="medium" color="primary"
              >
                {!alreadyClaimed ? 'Claim donations' : 'Claim ownership'}
              </Button>
            </div>
          </Tooltip>
        </div>
      </Paper>
    </div>
  )
}

export default ClaimWebsiteCard;
