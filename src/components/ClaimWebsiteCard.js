import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import ClaimWebsiteScreen from './ClaimWebsiteScreen'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button'
import Tooltip from '@material-ui/core/Tooltip'

function ClaimWebsiteCard({ classes }) {
  const [screenOpen, setScreenOpen] = React.useState(false)

  return (
    <div>
      <Paper className={classes.paper}>
        <div className={classes.container}>
          <Typography variant="subtitle1">
            Is this your site?
          </Typography>
          <Tooltip title={'claim ownership of this site'} enterDelay={300}>
            <div>
              <Button
                onClick={() => setScreenOpen(!screenOpen)}
                variant="contained" size="medium" color="primary"
              >
                Claim donations
              </Button>
            </div>
          </Tooltip>
        </div>
      </Paper>
      <ClaimWebsiteScreen
        open={screenOpen}
        onClose={() => setScreenOpen(false)}
      />
    </div>
  )
}

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

export default withStyles(styles)(ClaimWebsiteCard);
