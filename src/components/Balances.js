import React from 'react'
import { makeStyles } from '@material-ui/styles'
import QRCodeScreen from '../containers/QRCodeScreen'
import Table from './Table'
import TableRow from '@material-ui/core/TableRow'
import TableCell from '@material-ui/core/TableCell'
import Typography from '@material-ui/core/Typography'
import Tooltip from '@material-ui/core/Tooltip'

const useStyles = makeStyles(theme => ({
    paper: {
      paddingTop: theme.spacing(2),
      paddingRight: theme.spacing(2),
      paddingBottom: theme.spacing(2),
      paddingLeft: theme.spacing(2),
    },
    tableRow: {
      cursor: 'pointer',
    }
}));

const headerCells = [
  {label: 'Name', width: '45%', sortable: true, cellProps: {key: 'name', padding: 'default', numeric: false}},
  {label: 'Balance', width: '22%', sortable: true, cellProps: {key: 'balance', padding: 'none', numeric: true}},
]

function Balances({ balances }) {
  const classes = useStyles()
  return (
    <Table
      title="Balances"
      className={classes.table}
      headerCells={headerCells}
      rowsData={balances}
      fixedIndices={[0,1]}
      titleComponent={<QRCodeScreen />}
    >
      {(holding, index) => (
        <TableRow className={classes.tableRow} hover key={index}>
          <TableCell className={classes.tableCell}>
            <Tooltip title={holding.name}>
              <Typography variant="subtitle1">
                {Array.from(holding.name.substring(0, 30)).map((c, i) => i!==29 ? c : String.fromCharCode(8230)).join('')}
              </Typography>
            </Tooltip>
          </TableCell>
          <TableCell className={classes.tableCell} align="right" padding="none">
            <Tooltip title={holding.balance}>
              <Typography variant="subtitle1">
                {holding.balance.toFixed(3)}
              </Typography>
            </Tooltip>
          </TableCell>
        </TableRow>
      )}
    </Table>
  )
}

export default Balances
