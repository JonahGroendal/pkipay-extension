import React from 'react'
import Table from './Table'
import TableRow from '@material-ui/core/TableRow'
import TableCell from '@material-ui/core/TableCell'
import { withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import Tooltip from '@material-ui/core/Tooltip'

const headerCells = [
  {label: 'Name', width: '45%', sortable: true, cellProps: {key: 'name', padding: 'default', numeric: false}},
  {label: 'Balance', width: '22%', sortable: true, cellProps: {key: 'balance', padding: 'none', numeric: true}},
]

const Balances = ({ balances, classes }) => (
  <Table
    title="Balances"
    className={classes.table}
    headerCells={headerCells}
    rowsData={balances}
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

const styles = theme => ({
  paper: {
    paddingTop: theme.spacing(2),
    paddingRight: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    paddingLeft: theme.spacing(2),
  },
  tableRow: {
    cursor: 'pointer',
  },
})

export default withStyles(styles)(Balances)
