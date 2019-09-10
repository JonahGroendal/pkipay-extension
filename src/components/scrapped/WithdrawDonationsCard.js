import React from 'react'
import { makeStyles } from '@material-ui/styles';
import Paper from '@material-ui/core/Paper'
import Button from '@material-ui/core/Button'
import CircularProgress from '@material-ui/core/CircularProgress';

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
    justifyContent: 'flex-end'
  },
  buttonProgress: {
    position: 'absolute',
  }
}));

function WithdrawDonationsCard({ onClick }) {
  const [loading, setLoading] = React.useState(false);
  const classes = useStyles();

  async function handleClick() {
    setLoading(true);
    await onClick();
    setLoading(false);
  }

  return (
    <div>
      <Paper className={classes.paper}>
        <div className={classes.container}>
          <div>
            <Button
              onClick={handleClick}
              disabled={loading}
              variant="contained" size="medium" color="primary"
            >
              {"Withdraw donations"}
              {loading && <CircularProgress size={24} className={classes.buttonProgress}/>}
            </Button>
          </div>
        </div>
      </Paper>
    </div>
  )
}

export default WithdrawDonationsCard;
