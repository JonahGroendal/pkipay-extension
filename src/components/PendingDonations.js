import React from 'react'
// import { makeStyles } from '@material-ui/styles'
import Table from './Table'
import TableRow from '@material-ui/core/TableRow'
import TableCell from '@material-ui/core/TableCell'
import Typography from '@material-ui/core/Typography'
import Tooltip from '@material-ui/core/Tooltip'

// const useStyles = makeStyles(theme => ({
//
// }));

const headerCells = [
  {label: 'To', width: '47%', sortable: true, cellProps: {key: 'donee', numeric: false}},
  {label: 'Amount', width: '30%', sortable: true, cellProps: {key: 'balance', numeric: true}},
  {label: 'Token', width: '23%', sortable: true, cellProps: {key: 'token', numeric: false}},
]

function PendingDonations(props) {
  const { pendingDonations } = props;

  return (
    <Table
      title="Pending Donations"
      headerCells={headerCells}
      rowsData={pendingDonations}
    >
      {(pendingDonation, index) => (
        <TableRow hover key={index}>
          <TableCell>
            <Tooltip title={pendingDonation.donee}>
              <Typography variant="subtitle1">
                {Array.from(pendingDonation.donee.replace('.dnsroot.eth', '').replace('.dnsroot.test', '').substring(0, 20)).map((c, i) => i!==19 ? c : String.fromCharCode(8230)).join('')}
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
            <Tooltip title={pendingDonation.token}>
              <Typography variant="subtitle1">
                {Array.from(pendingDonation.token.substring(0, 5)).map((c, i) => i!==4 ? c : String.fromCharCode(8230)).join('')}
              </Typography>
            </Tooltip>
          </TableCell>
        </TableRow>
      )}
    </Table>
  )
}

export default PendingDonations
