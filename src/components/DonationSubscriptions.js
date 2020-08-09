import React from 'react'
import { makeStyles } from '@material-ui/styles'
import Table from './Table'
import TableRow from '@material-ui/core/TableRow'
import TableCell from '@material-ui/core/TableCell'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import DeleteOutlinedIcon from '@material-ui/icons/DeleteForeverOutlined'
import KeyboardArrowLeftIcon from '@material-ui/icons/KeyboardArrowLeft'
import Tooltip from '@material-ui/core/Tooltip'
import classNames from 'classnames'
import { truncateForDisplay } from '../api/utils'
import { addresses } from '../api/blockchain'

const useStyles = makeStyles(theme => ({
  amount: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'baseline',
  },
  button: {
    minWidth: 0,
    padding: 0,
  },
  buttonToProfile: {
    padding: 0,
  }
}));

const headerCells = [
  {label: '', width: '16%', sortable: false, cellProps: {key: 'toProfile', numeric: false}},
  {label: 'Site', width: '40%', sortable: true, cellProps: {key: 'name', numeric: false}},
  {label: 'Amount', width: '29%', sortable: true, cellProps: {key: 'amount', numeric: true}},
  {label: '', width: '15%', sortable: false, cellProps: {key: 'unsubscribe', numeric: false}},
]

const getTokenSymbol = (tokenAddr, addedTokens) => {
  return [
    ...Object.keys(addresses).map(symbol => ({ symbol, address: addresses[symbol] })),
    ...addedTokens
  ]
  .find(token => token.address === tokenAddr).symbol
}


function DonationSubscriptions(props) {
  const {
    subscriptions,
    onUnsubscribe,
    onClickSubscription,
    currency,
    currencySymbol,
    nextPayment,
    highlightedRowIndex,
    addedTokens
  } = props
  const classes = useStyles()

  console.log('subscriptions', subscriptions)

  return (
    <Table
      title="Monthly Subscriptions"
      subtitle={"next payout on " + nextPayment.toLocaleDateString()}
      headerCells={headerCells}
      rowsData={subscriptions}
      rowsPerPage={4}
      highlightedRowIndex={highlightedRowIndex}
    >
      {(subscription, index) => (
        <TableRow hover tabIndex={-1} key={index}>
          <TableCell
            onClick={() => onClickSubscription(subscription)}>
            <Tooltip title="Go to profile" enterDelay={500}>
              <Button className={classNames(classes.button, classes.buttonToProfile)} size="small"
                aria-label="Launch" fullWidth>
                <KeyboardArrowLeftIcon />
                  <img
                    src={'https://www.google.com/s2/favicons?domain=' + subscription.address.replace('.dnsroot.eth', '').replace('.dnsroot.test', '')}
                    height="16px" width="16px"
                    style={{ borderRadius: "50%" }}
                    alt="favicon"
                  />
              </Button>
            </Tooltip>
          </TableCell>
          <TableCell component="th" scope="row"
            onClick={() => onClickSubscription(subscription)}>
            <Tooltip title={subscription.address} enterDelay={500}>
              <Typography variant="subtitle1">
                {truncateForDisplay(subscription.address.replace('.dnsroot.eth', '').replace('.dnsroot.test', ''), 16)}
              </Typography>
            </Tooltip>
          </TableCell>
          <TableCell align="right">
            <Tooltip title={subscription.amount.toFixed(2)+' '+currency+' per month'} enterDelay={500}>
              <div className={classes.amount}>
                <Typography variant="subtitle1">
                  {subscription.amount.toFixed(3).concat(' ', getTokenSymbol(subscription.tokenAddr, addedTokens))}
                </Typography>
              </div>
            </Tooltip>
          </TableCell>
          <TableCell >
            {!subscription.permanent && <Tooltip title="Unsubscribe" enterDelay={500}>
              <Button className={classes.button}
                onClick={() => onUnsubscribe(subscription.address, subscription.tokenAddr)}
                size="small" aria-label="Launch">
                <DeleteOutlinedIcon />
              </Button>
            </Tooltip>}
          </TableCell>
        </TableRow>
      )}
    </Table>
  )
}

export default DonationSubscriptions
