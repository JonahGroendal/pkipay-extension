import React, { Component } from 'react'
import Table from './Table'
import TableRow from '@material-ui/core/TableRow'
import TableCell from '@material-ui/core/TableCell'
import { withStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'

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

class Hodlings extends Component {
  constructor(props) {
    super(props)
    this.state = {

    }
  }

  render() {
    const { classes } = this.props
    const headerCells = [
      {label: 'Site', width: '45%', sortable: true, cellProps: {key: 'name', padding: 'default', numeric: false}},
      {label: 'Balance', width: '22%', sortable: true, cellProps: {key: 'balance', padding: 'none', numeric: true}},
      {label: 'Total Supply', width: '33%', sortable: false, cellProps: {key: 'supply', padding: 'dense', numeric: true}},
    ]
    const mockData = [
      {name: 'wikipedia.org', balance: 10, totalSupply: 120000},
      {name: 'github.com', balance: 44, totalSupply: 10000},
    ]
    return (
      <Table className={classes.table} title="THX Holdings"
        headerCells={headerCells} rowsData={mockData}>
        {rowData => <TableRow className={classes.tableRow} hover key={0}>
          <TableCell className={classes.tableCell}>
            <Typography variant="subheading">
              {rowData.name}
            </Typography>
          </TableCell>
          <TableCell className={classes.tableCell} numeric={true} padding="none">
            <Typography variant="subheading">
              {rowData.balance}
            </Typography>
          </TableCell>
          <TableCell className={classes.tableCell} numeric={true}>
            <Typography variant="subheading">
              {rowData.totalSupply}
            </Typography>
          </TableCell>
        </TableRow>}
      </Table>
    )
  }
}

export default withStyles(styles)(Hodlings)
