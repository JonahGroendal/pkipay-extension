import React, { Component } from 'react'
import { getFormattedViews, setIncluded } from './api/storageDb'
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
  buttonRemove: {
    padding: 0,
    width: '100%',
    minWidth: 0,
  },
})

class MostViewedSites extends Component {
  constructor(props) {
    super(props)
    this.state = {
      views: [],
    }
  }

  componentDidMount() {
    this.updateViews()
  }

  async updateViews() {
    const views = await getFormattedViews()
    this.setState({
      views: views
    })
  }

  render() {
    if (!this.state.views) return
    const { classes } = this.props
    const { views } = this.state
    console.log(views)
    const headerCells = [
      {label: 'Site', width: '70%', sortable: true, cellProps: {key: 'hostname', padding: 'default', numeric: false}},
      {label: 'Share', width: '30%', sortable: true, cellProps: {key: 'share', padding: 'dense', numeric: true}},
      {label: '', width: '14%', sortable: false, cellProps: {key: 'delete', padding: 'none', numeric: false}},
    ]
    return (
      <Table
        headerCells={headerCells}
        rowsData={views}
        initOrderBy="hostname"
        classes={{ tableRowHead: classes.tableRowHead }}
      >
        {(rowData, index) => <TableRow className={classes.tableRow} hover key={rowData.id}>
          <TableCell className={classes.tableCell}>
            <Typography variant="subheading">
              {rowData.hostname}
            </Typography>
          </TableCell>
          <TableCell className={classes.tableCell} numeric={true} padding="none">
            <Typography variant="subheading">
              {rowData.share + '%'}
            </Typography>
          </TableCell>
          <TableCell padding="none" className={classes.tableCell}>
            <Tooltip title="remove">
              <Button className={classes.buttonRemove} size="small" aria-label="Remove"
                onClick={e => setIncluded(rowData.id, false).then(this.updateViews())}>
                <DeleteOutlinedIcon />
              </Button>
            </Tooltip>
          </TableCell>
        </TableRow>}
      </Table>
    )
  }
}

export default withStyles(styles)(MostViewedSites)
