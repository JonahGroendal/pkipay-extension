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

const Subscriptions = ({ subscriptions, onUnsubscribe, onClickSubscription,
                         currency, currencySymbol, nextPayment, classes }) => (
  <Table
    className={classes.table} title="Monthly Subscriptions"
    subtitle={"next payment on " + nextPayment.toLocaleDateString()}
    headerCells={headerCells} rowsData={subscriptions} rowsPerPage={4} fixedRows={[0,]}
  >
    {(subscription, index) => <TableRow
      className={classes.tableRow} hover tabIndex={-1} key={index}>
      <TableCell className={classes.tableCell}
        onClick={() => onClickSubscription(subscription)}>
        <Tooltip title="Go to profile">
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
      <TableCell component="th" scope="row" className={classes.tableCell}
        onClick={() => onClickSubscription(subscription)}>
        <Tooltip title={subscription.hostname}>
          <Typography variant="subheading">
            {subscription.name ? subscription.name : subscription.hostname}
          </Typography>
        </Tooltip>
      </TableCell>
      <TableCell className={classes.tableCell} numeric={true}>
        <Tooltip title={subscription.amount+' '+currency+' per month'}>
          <div className={classes.amount}>
            <Typography variant="subheading">
              {currencySymbol + subscription.amount}
            </Typography>
          </div>
        </Tooltip>
      </TableCell>
      <TableCell className={classes.tableCell}>
        {!subscription.permanent && <Tooltip title="Unsubscribe">
          <Button className={classes.button}
            onClick={() => onUnsubscribe(subscription.hostname)}
            size="small" aria-label="Launch">
            <DeleteOutlinedIcon />
          </Button>
        </Tooltip>}
      </TableCell>
    </TableRow>}
  </Table>
)

const styles = theme => ({
  root: {
    width: '100%'
  },
  table: {
    width: '100%',
    tableLayout: 'fixed',
  },
  tableRow: {
    height: theme.spacing.unit * 5,
  },
  tableCell: {
    borderBottom: 0,
  },
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
  },
  profileImage: {
    marginRight: '0 !important',
  },
  pagination: {
    height: theme.spacing.unit * 6,
    minHeight: 0,
  },
})

export default withStyles(styles)(Subscriptions)
