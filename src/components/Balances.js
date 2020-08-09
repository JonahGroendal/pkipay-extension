import React from 'react'
import { makeStyles } from '@material-ui/styles'
import DEXSwapScreen from '../containers/DEXSwapScreen'
import AddTokenModal from '../containers/AddTokenModal'
import Table from './Table'
import TableRow from '@material-ui/core/TableRow'
import TableCell from '@material-ui/core/TableCell'
import Typography from '@material-ui/core/Typography'
import Tooltip from '@material-ui/core/Tooltip'
import Button from '@material-ui/core/Button';
import SwapHorizIcon from '@material-ui/icons/SwapHoriz';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import { truncateForDisplay } from '../api/utils'
import DeleteOutlinedIcon from '@material-ui/icons/DeleteForeverOutlined'

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
    lastRowCell: {
      width: '100%'
    },
    dexButtonContent: {
      marginBottom: '-2px'
    },
    addTokenText: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    },
    removeButton: {
      minWidth: 0,
      padding: 0,
    },
}));

const headerCells = [
  {label: 'Name', width: '44%', sortable: true, cellProps: {key: 'name', padding: 'default', numeric: false}},
  {label: 'Symbol', width: '18%', sortable: true, cellProps: {key: 'symbol', padding: 'default', numeric: false}},
  {label: 'Balance', width: '25%', sortable: true, cellProps: {key: 'balance', padding: 'default', numeric: true}},
  {label: '', width: '13%', sortable: false, cellProps: {key: 'unsubscribe', numeric: false}},
]


function Balances(props) {
  const {
    balances,
    onClickBalance,
    onClickExchange,
    dexScreenOpen,
    onCloseDexScreen,
    onClickAddFunds,
    onClickRemoveToken
  } = props

  const classes = useStyles()

  const [addTokenModalOpen, setAddTokenModalOpen] = React.useState(false)

  return (
    <React.Fragment>
      <DEXSwapScreen open={dexScreenOpen} onClose={onCloseDexScreen} />
      <AddTokenModal open={addTokenModalOpen} onClose={() => setAddTokenModalOpen(false)} />
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
          <Button
            variant="outlined"
            size="small"
            onClick={onClickAddFunds}
          >
            Add funds
          </Button>
        ]}
        lastRow={
          <TableRow key="lastRow">
            <TableCell className={classes.lastRowCell}>
              <Typography variant="subtitle1">
                <Button onClick={() => setAddTokenModalOpen(true)}>
                  <AddCircleIcon color="primary"/>&nbsp;Add token
                </Button>
              </Typography>
            </TableCell>
          </TableRow>
        }
      >
        {(holding, index) => (
          <TableRow
            key={index}
            className={!holding.address ? classes.tableRow : undefined}
            hover={!holding.address}
            onClick={() => onClickBalance(holding.name)}
          >
            <TableCell className={classes.tableCell}>
              <Tooltip title={holding.name}>
                <Typography variant="subtitle1">
                  {truncateForDisplay(holding.name.replace('.dnsroot.eth', '').replace('.dnsroot.test', ''), 20)}
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
            <TableCell className={classes.tableCell}>
              {!!holding.address && (
                <Tooltip title="Remove token">
                  <Button
                    className={classes.removeButton}
                    size="small"
                    onClick={() => onClickRemoveToken(holding.address)}
                  >
                    <DeleteOutlinedIcon />
                  </Button>
                </Tooltip>
              )}
            </TableCell>
          </TableRow>
        )}
      </Table>
    </React.Fragment>
  )
}

export default Balances
