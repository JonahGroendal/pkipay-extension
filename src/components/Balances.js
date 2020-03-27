import React from 'react'
import { makeStyles } from '@material-ui/styles'
import QRCodeScreen from '../containers/QRCodeScreen'
import Table from './Table'
import TableRow from '@material-ui/core/TableRow'
import TableCell from '@material-ui/core/TableCell'
import Typography from '@material-ui/core/Typography'
import Tooltip from '@material-ui/core/Tooltip'
import { truncateForDisplay, isEnsName, isEnsNode } from '../api/utils'

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
  {label: 'Name', width: '55%', sortable: true, cellProps: {key: 'name', padding: 'default', numeric: false}},
  {label: 'Symbol', width: '20%', sortable: true, cellProps: {key: 'symbol', padding: 'default', numeric: false}},
  {label: 'Balance', width: '25%', sortable: true, cellProps: {key: 'balance', padding: 'default', numeric: true}},
]


function Balances({ balances, onClickBalance }) {
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
        <TableRow
          key={index}
          className={classes.tableRow}
          hover
          onClick={() => {
            if (isEnsName(holding.name) || isEnsNode(holding.name))
              onClickBalance(holding.name)
          }}
        >
          <TableCell className={classes.tableCell}>
            <Tooltip title={holding.name}>
              <Typography variant="subtitle1">
                {truncateForDisplay(holding.name.replace('.dnsroot.eth', '').replace('.dnsroot.test', ''), 16)}
              </Typography>
            </Tooltip>
          </TableCell>
          <TableCell className={classes.tableCell}>
            <Tooltip title={holding.symbol}>
              <Typography variant="subtitle1">
                {holding.symbol}
              </Typography>
            </Tooltip>
          </TableCell>
          <TableCell className={classes.tableCell} align="right">
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
