import React, { Component } from 'react'
import strings from './api/strings'
import BrowserStorageContext from './BrowserStorageContext'
import Table from './Table'
import TableRow from '@material-ui/core/TableRow'
import TableCell from '@material-ui/core/TableCell'
import { withStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import DeleteOutlinedIcon from '@material-ui/icons/DeleteForeverOutlined'
import KeyboardArrowLeftIcon from '@material-ui/icons/KeyboardArrowLeft'
import AccountCircleIcon from '@material-ui/icons/AccountCircle'
import Tooltip from '@material-ui/core/Tooltip'

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
    //overflow: 'hidden'
  },
  buttonUnsubscribe: {
    padding: 0,
    width: '100%',
    minWidth: 0,
  },
  pagination: {
    height: theme.spacing.unit * 6,
    minHeight: 0,
  },
})

class Subscriptions extends Component {
  constructor(props) {
    super(props)
    this.state = {

    }
  }

  render() {
    const { classes, onViewProfile } = this.props
    const headerCells = [
      {label: '', width: '20%', sortable: false, cellProps: {key: 'toProfile', padding: 'none', numeric: false}},
      {label: 'Site', width: '46%', sortable: true, cellProps: {key: 'name', padding: 'none', numeric: false}},
      {label: 'Amount', width: '20%', sortable: true, cellProps: {key: 'share', padding: 'none', numeric: true}},
      {label: '', width: '14%', sortable: false, cellProps: {key: 'unsubscribe', padding: 'none', numeric: false}},
    ]
    return (
      <BrowserStorageContext.Consumer>
        {storage => {
          if (!storage.state) return
          const { state, removeFromSubs } = storage
          const nextPayment = strings.paymentSchedule[state.settings.paymentSchedule](Date.now())
          console.log()
          return <Table
            className={classes.table} title="Monthly Subscriptions"
            subtitle={"next payment on " + nextPayment.toLocaleDateString()}
            headerCells={headerCells} rowsData={state.subs} rowsPerPage={4} fixedRows={[0,]}
          >
            {(subscription, index) => <TableRow
              className={classes.tableRow} hover tabIndex={-1} key={index}>
              <TableCell padding="none" className={classes.tableCell}
                onClick={event => onViewProfile(subscription.hostname)}>
                <Tooltip title="go to profile">
                  <Button className={classes.buttonUnsubscribe} size="small" aria-label="Launch">
                    <KeyboardArrowLeftIcon />
                    {
                      subscription.hostname.includes("#")
                      ? <AccountCircleIcon />
                      : <img src={'https://www.google.com/s2/favicons?domain=' + subscription.hostname}
                        height="16px" width="16px" style={{marginRight: '8px'}}/>
                    }
                  </Button>
                </Tooltip>
              </TableCell>
              <TableCell component="th" scope="row" padding="none" className={classes.tableCell}
                onClick={event => onViewProfile(subscription.hostname)}>
                <Tooltip title={subscription.hostname}>
                  <Typography variant="subheading">
                    {subscription.hostname}
                  </Typography>
                </Tooltip>
              </TableCell>
              <TableCell padding="none" className={classes.tableCell} numeric={true}>
                <Tooltip title={subscription.amount+' '+state.settings.currency+' per month'}>
                  <div className={classes.amount}>
                    <Typography variant="subheading">
                      {subscription.amount+' '+strings.currency[state.settings.currency]}
                    </Typography>
                  </div>
                </Tooltip>
              </TableCell>
              <TableCell padding="none" className={classes.tableCell}>
                {(subscription.hostname !== "gratiis#mostViewedSites") && <Tooltip title="unsubscribe">
                  <Button className={classes.buttonUnsubscribe}
                    onClick={e => removeFromSubs(subscription.hostname)}
                    size="small" aria-label="Launch">
                    <DeleteOutlinedIcon />
                  </Button>
                </Tooltip>}
              </TableCell>
            </TableRow>}
          </Table>
        }}
      </BrowserStorageContext.Consumer>

    )
  }
}

export default withStyles(styles)(Subscriptions)
