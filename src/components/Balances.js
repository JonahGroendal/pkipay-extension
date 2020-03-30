import React from 'react'
import { makeStyles } from '@material-ui/styles'
import QRCodeScreen from '../containers/QRCodeScreen'
import DEXSwapScreen from '../containers/DEXSwapScreen'
import Table from './Table'
import TableRow from '@material-ui/core/TableRow'
import TableCell from '@material-ui/core/TableCell'
import Typography from '@material-ui/core/Typography'
import Tooltip from '@material-ui/core/Tooltip'
import Button from '@material-ui/core/Button';
import SwapHorizIcon from '@material-ui/icons/SwapHoriz';
import { truncateForDisplay } from '../api/utils'

const useStyles = makeStyles(theme => ({
    paper: {
      paddingTop: theme.spacing(2),
      paddingRight: theme.spacing(2),
      paddingBottom: theme.spacing(2),
      paddingLeft: theme.spacing(2),
    },
    tableRow: {
      cursor: 'pointer',
    },
    dexButtonContent: {
      marginBottom: '-2px'
    }
}));

const headerCells = [
  {label: 'Name', width: '55%', sortable: true, cellProps: {key: 'name', padding: 'default', numeric: false}},
  {label: 'Symbol', width: '20%', sortable: true, cellProps: {key: 'symbol', padding: 'default', numeric: false}},
  {label: 'Balance', width: '25%', sortable: true, cellProps: {key: 'balance', padding: 'default', numeric: true}},
]


function Balances({ balances, onClickBalance, onClickExchange, dexScreenOpen, onCloseDexScreen }) {
  const classes = useStyles()
  return (
    <React.Fragment>
      <DEXSwapScreen open={dexScreenOpen} onClose={onCloseDexScreen} />
      <Table
        title="Balances"
        className={classes.table}
        headerCells={headerCells}
        rowsData={balances}
        fixedIndices={[0,1]}
        titleComponents={[
          <Tooltip title="Exchange ETH for DAI">
            <Button
              onClick={onClickExchange}
              variant="outlined"
              size="small"
            >
              ETH
              <div className={classes.dexButtonContent}>
                <SwapHorizIcon />
              </div>
              DAI
            </Button>
          </Tooltip>,
          <QRCodeScreen />
        ]}
      >
        {(holding, index) => (
          <TableRow
            key={index}
            className={classes.tableRow}
            hover
            onClick={() => onClickBalance(holding.name)}
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
    </React.Fragment>
  )
}

export default Balances
