import React from 'react'
import { makeStyles } from '@material-ui/styles'
import Table from './Table'
import TableRow from '@material-ui/core/TableRow'
import TableCell from '@material-ui/core/TableCell'
import Typography from '@material-ui/core/Typography'
import Tooltip from '@material-ui/core/Tooltip'
import ReclaimDonationsScreen from '../containers/ReclaimDonationsScreen.js'
import { truncateForDisplay } from '../api/utils'

const useStyles = makeStyles(theme => ({
  tableRow: {
    cursor: 'pointer'
  }
}));

const headerCells = [
  {label: 'To', width: '47%', sortable: true, cellProps: {key: 'doneeName', numeric: false}},
  {label: 'Amount', width: '30%', sortable: true, cellProps: {key: 'balance', numeric: true}},
  {label: 'Token', width: '23%', sortable: true, cellProps: {key: 'tokenSymbol', numeric: false}},
]

function PendingDonations(props) {
  const classes = useStyles()
  const { pendingDonations } = props;
  const [clickedDonation, setClickedDonation] = React.useState(null)

  return (
    <React.Fragment>
      <ReclaimDonationsScreen
        open={clickedDonation !== null}
        onClose={() => setClickedDonation(null)}
        donation={clickedDonation}
      />
      <Table
        title="Pending Donations"
        headerCells={headerCells}
        rowsData={pendingDonations}
      >
        {(pendingDonation, index) => (
          <TableRow hover key={index} className={classes.tableRow} onClick={() => setClickedDonation(pendingDonation)}>
            <TableCell>
              <Tooltip title={pendingDonation.doneeName}>
                <Typography variant="subtitle1">
                  {truncateForDisplay(pendingDonation.doneeName.replace('.dnsroot.eth', '').replace('.dnsroot.test', ''), 16)}
                </Typography>
              </Tooltip>
            </TableCell>
            <TableCell align="right">
              <Tooltip title={pendingDonation.balance}>
                <Typography variant="subtitle1">
                  {pendingDonation.balance.toFixed(3)}
                </Typography>
              </Tooltip>
            </TableCell>
            <TableCell>
              <Tooltip title={pendingDonation.tokenSymbol}>
                <Typography variant="subtitle1">
                  {truncateForDisplay(pendingDonation.tokenSymbol, 5)}
                </Typography>
              </Tooltip>
            </TableCell>
          </TableRow>
        )}
      </Table>
    </React.Fragment>
  )
}

export default PendingDonations
