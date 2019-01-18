import React, { Component } from 'react'
import Table from './Table'
import TableRow from '@material-ui/core/TableRow'
import TableCell from '@material-ui/core/TableCell'
import { withStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import Tooltip from '@material-ui/core/Tooltip'

const headerCells = [
  {label: 'Site', width: '45%', sortable: true, cellProps: {key: 'name', padding: 'default', numeric: false}},
  {label: 'Balance', width: '22%', sortable: true, cellProps: {key: 'balance', padding: 'none', numeric: true}},
]
const mockData = [
  {name: 'wikipedia.org', balance: 10},
  {name: 'github.com', balance: 44},
]

const Hodlings = ({ balances, currencySymbol, classes }) => (
  <Table
    title="THX Holdings"
    className={classes.table}
    headerCells={headerCells}
    rowsData={balances}
  >
    {(holding, index) => (
      <TableRow className={classes.tableRow} hover key={index}>
        <TableCell className={classes.tableCell}>
          <Tooltip title={holding.name}>
            <Typography variant="subheading">
              {holding.name}
            </Typography>
          </Tooltip>
        </TableCell>
        <TableCell className={classes.tableCell} numeric={true} padding="none">
          <Tooltip title={holding.balance + " THX"}>
            <Typography variant="subheading">
              {currencySymbol + holding.balance.toFixed(2)}
            </Typography>
          </Tooltip>
        </TableCell>
      </TableRow>
    )}
  </Table>
)

const styles = theme => ({
  paper: {
    paddingTop: theme.spacing.unit * 2,
    paddingRight: theme.spacing.unit * 2,
    paddingBottom: theme.spacing.unit * 2,
    paddingLeft: theme.spacing.unit * 2,
  },
  tableRow: {
    cursor: 'pointer',
  },
})

export default withStyles(styles)(Hodlings)
