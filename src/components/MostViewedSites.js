import React from 'react'
import { getFormattedViews, setIncluded } from '../api/storageDb'
import Table from './Table'
import TableRow from '@material-ui/core/TableRow'
import TableCell from '@material-ui/core/TableCell'
import { withStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import DeleteOutlinedIcon from '@material-ui/icons/DeleteForeverOutlined'
import Tooltip from '@material-ui/core/Tooltip'

const styles = theme => ({
  paper: {
    paddingTop: theme.spacing.unit * 2,
    paddingRight: theme.spacing.unit * 2,
    paddingBottom: theme.spacing.unit * 2,
    paddingLeft: theme.spacing.unit * 2,
  },
  tableRowHead: {
    height: theme.spacing.unit * 5,
  },
  tableRow: {
    cursor: 'pointer',
  },
  button: {
    minWidth: 0,
    padding: 0,
  },
})

function MostViewedSites(props) {
  const [views, setViews] = React.useState([])

  React.useEffect(() => {
    getFormattedViews().then(setViews)
  }, [])

  const handleClickRemove = (viewID) => () => {
    setIncluded(viewID, false)
    .then(() => getFormattedViews())
    .then(setViews)
  }

  //if (!views) return
  const { classes } = props
  const headerCells = [
    {label: 'Site', width: '55%', sortable: true, cellProps: {key: 'hostname', numeric: false}},
    {label: 'Share', width: '30%', sortable: true, cellProps: {key: 'share', numeric: true}},
    {label: '', width: '15%', sortable: false, cellProps: {key: 'delete', numeric: false}},
  ]
  return (
    <Table
      headerCells={headerCells}
      rowsData={views}
      initOrderBy="share"
      classes={{ tableRowHead: classes.tableRowHead }}
    >
      {(view, index) => <TableRow className={classes.tableRow} hover key={view.id}>
        <TableCell className={classes.tableCell}>
          <Tooltip title={view.hostname}>
            <Typography variant="subtitle1" noWrap>
              {view.hostname}
            </Typography>
          </Tooltip>
        </TableCell>
        <TableCell className={classes.tableCell} numeric={true}>
          <Typography variant="subtitle1" noWrap>
            {view.share + '%'}
          </Typography>
        </TableCell>
        <TableCell className={classes.tableCell}>
          <Tooltip title="Remove view">
            <Button className={classes.button} size="small"
              aria-label="Remove" fullWidth
              onClick={handleClickRemove(view.id)}>
              <DeleteOutlinedIcon />
            </Button>
          </Tooltip>
        </TableCell>
      </TableRow>}
    </Table>
  )
}

export default withStyles(styles)(MostViewedSites)
