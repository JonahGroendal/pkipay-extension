import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import Table from './Table'
import TableRow from '@material-ui/core/TableRow'
import TableCell from '@material-ui/core/TableCell'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import DeleteOutlinedIcon from '@material-ui/icons/DeleteForeverOutlined'
import KeyboardArrowLeftIcon from '@material-ui/icons/KeyboardArrowLeft'
import AccountCircleIcon from '@material-ui/icons/AccountCircle'
import Tooltip from '@material-ui/core/Tooltip'
import classNames from 'classnames'

const headerCells = [
  {label: '', width: '16%', sortable: false, cellProps: {key: 'toProfile', numeric: false}},
  {label: 'Site', width: '47%', sortable: true, cellProps: {key: 'name', numeric: false}},
  {label: 'Amount', width: '22%', sortable: true, cellProps: {key: 'amount', numeric: true}},
  {label: '', width: '15%', sortable: false, cellProps: {key: 'unsubscribe', numeric: false}},
]

const Subscriptions = ({
  subscriptions,
  highlightedSubscription,
  onUnsubscribe,
  onClickSubscription,
  currency,
  currencySymbol,
  nextPayment,
  classes,
  highlightedRowIndex,
}) => (
  <Table
    title="Monthly Subscriptions"
    subtitle={"next payment on " + nextPayment.toLocaleDateString()}
    headerCells={headerCells}
    rowsData={subscriptions}
    rowsPerPage={4}
    fixedRows={[0,]}
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
              {
                subscription.hostname.includes("#")
                ? <AccountCircleIcon style={{width: "19.5px", height: "19.5px", marginLeft: "-1.75px", marginRight: "-1.75px"}}/>
                : <img src={'https://www.google.com/s2/favicons?domain=' + subscription.hostname}
                  height="16px" width="16px" style={{ borderRadius: "50%" }}
                  alt="favicon"/>
              }
            </Button>
          </Tooltip>
        </TableCell>
        <TableCell component="th" scope="row"
          onClick={() => onClickSubscription(subscription)}>
          <Tooltip title={subscription.hostname} enterDelay={500}>
            <Typography variant="subtitle1">
              {subscription.name
                ? Array.from(subscription.name.substring(0, 20)).map((c, i) => i!==19 ? c : String.fromCharCode(8230)).join('')
                : Array.from(subscription.hostname.substring(0, 20)).map((c, i) => i!==19 ? c : String.fromCharCode(8230)).join('')
              }
            </Typography>
          </Tooltip>
        </TableCell>
        <TableCell align="numeric">
          <Tooltip title={subscription.amount.toFixed(2)+' '+currency+' per month'} enterDelay={500}>
            <div className={classes.amount}>
              <Typography variant="subtitle1">
                {currencySymbol + subscription.amount.toFixed(2)}
              </Typography>
            </div>
          </Tooltip>
        </TableCell>
        <TableCell >
          {!subscription.permanent && <Tooltip title="Unsubscribe" enterDelay={500}>
            <Button className={classes.button}
              onClick={() => onUnsubscribe(subscription.hostname)}
              size="small" aria-label="Launch">
              <DeleteOutlinedIcon />
            </Button>
          </Tooltip>}
        </TableCell>
      </TableRow>
    )}
  </Table>
)

const styles = theme => ({
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
})

export default withStyles(styles)(Subscriptions)
