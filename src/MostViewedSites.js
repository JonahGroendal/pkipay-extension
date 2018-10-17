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
  button: {
    minWidth: 0,
    padding: 0,
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
        {(rowData, index) => <TableRow className={classes.tableRow} hover key={rowData.id}>
          <TableCell className={classes.tableCell}>
            <Typography variant="subheading" noWrap>
              {rowData.hostname}
            </Typography>
          </TableCell>
          <TableCell className={classes.tableCell} numeric={true}>
            <Typography variant="subheading" noWrap>
              {rowData.share + '%'}
            </Typography>
          </TableCell>
          <TableCell className={classes.tableCell}>
            <Tooltip title="remove">
              <Button className={classes.button} size="small"
                aria-label="Remove" fullWidth
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
