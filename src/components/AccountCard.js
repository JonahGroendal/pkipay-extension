import React from 'react'
// import SubscribeForm from '../containers/SubscribeForm'
import { makeStyles } from '@material-ui/styles'
// import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
// import getPixels from 'get-pixels'
import { truncateForDisplay } from '../api/utils'

const useStyles = makeStyles(theme => ({
  rows: {
    // display: 'flex',
    // flexDirection: 'column',
  },
  row: {
    display: 'flex',
    justifyContent: 'center'
  },
  rowTop: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: theme.spacing(3)
  },
  rowBottom: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: theme.spacing(2)
  },
  spacer: {
    width: theme.spacing(6)
  },
  viewButtonLabel: {
    textTransform: "none"
  }
}));

function AccountCard({ address, ethBalance, ethBalanceInCurrency, currencySymbol, onClickSend, onClickBuy, onClickAccount }) {
  const classes = useStyles()

  return (
    <div>
      <div className={classes.rows}>
        <div className={classes.rowTop}>
          <Button
            variant="outlined"
            size="small"
            classes={{ label: classes.viewButtonLabel }}
            onClick={onClickAccount}
          >
            <Typography align="center">
              {truncateForDisplay(address, 15)}
            </Typography>
          </Button>
        </div>
        <div className={classes.row}>
          <Typography variant="h4" align="center">
            {ethBalance.toFixed(3).concat(' ETH')}
          </Typography>
        </div>
        <div className={classes.row}>
          <Typography /*variant="body2" */align="center">
            {currencySymbol.concat(ethBalanceInCurrency.toFixed(2))}
          </Typography>
        </div>
        <div className={classes.rowBottom}>
          <Button variant="contained" color="primary" onClick={onClickBuy}>
            Buy
          </Button>
          <div className={classes.spacer} />
          <Button variant="outlined" color="primary" onClick={onClickSend}>
            Send
          </Button>
        </div>
        {/*!props.adminViewEnabled && <div className={classes.subscribeContainer}>
          <SubscribeForm domainName={props.domainName} />
        </div>*/}
      </div>
    </div>
  )
}

export default AccountCard
