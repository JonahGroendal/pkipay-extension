import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import MuiTable from '@material-ui/core/Table'
import TableRow from '@material-ui/core/TableRow'
import TableCell from '@material-ui/core/TableCell'
import TableBody from '@material-ui/core/TableBody'
import Toolbar from '@material-ui/core/Toolbar'
import TablePagination from '@material-ui/core/TablePagination'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import TableHead from '@material-ui/core/TableHead'
import TableSortLabel from '@material-ui/core/TableSortLabel'
import Tooltip from '@material-ui/core/Tooltip'
import classNames from 'classnames'

const styles = theme => ({
  root: {
    width: '100%'
  },
  toolbar: {
    paddingTop: theme.spacing.unit * 2,
    paddingRight: theme.spacing.unit * 2,
    paddingLeft: theme.spacing.unit * 2,
    minHeight:  theme.spacing.unit * 6
  },
  table: {
    width: '100%',
    tableLayout: 'fixed',
  },
  tableRowHead: {
    height: theme.spacing.unit * 4,
  },
  tableRow: {
    height: theme.spacing.unit * 5,
  },
  tableCell: {
    borderBottom: 0,
  },
  pagination: {
    height: theme.spacing.unit * 6,
    minHeight: 0,
  },
})

function sort(data, order, orderBy, fixedIndices) {
  function getSorting(order, orderBy) {
    return order === 'desc'
      ? (a, b) => (b[orderBy] < a[orderBy] ? -1 : 1)
      : (a, b) => (a[orderBy] < b[orderBy] ? -1 : 1);
  }
  let sortedData = data.filter(index => !fixedIndices.includes(index))
  sortedData.sort(getSorting(order, orderBy))
  fixedIndices.forEach( index => {sortedData.splice(index, 0, data[index])} )
  return sortedData
}

class Table extends Component {
  constructor(props) {
    super(props)
    this.state = {
      //rowsData: sort(props.rowsData, props.initOrder, props.initOrderBy, props.fixedIndices),
      order: props.initOrder,
      orderBy: props.initOrderBy,
      page: 0,
    }
  }

  handleRequestSort = property => {
    const orderBy = property;
    let order = 'desc';
    if (this.state.orderBy === property && this.state.order === 'desc') {
      order = 'asc';
    }
    this.setState({ order, orderBy });
  };

  handleChangePage = (event, page) => {
    this.setState({ page });
  };

  render() {
    const { classes, children, title, subtitle, headerCells, rowsData, fixedIndices, rowsPerPage } = this.props
    const { order, orderBy, page } = this.state
    const rowsDataSorted = sort(this.props.rowsData, order, orderBy, fixedIndices)
    const rows = rowsDataSorted.map(children) //`children` is a render prop
    return (
      <Paper className={classes.root}>
        {(title !== '' || subtitle !== '') && <Toolbar className={classes.toolbar}>
          <div className={classes.title}>
            <Typography variant="title" id="tabletitle">
              {title}
            </Typography>
            {subtitle ? <Typography variant="body1">
              {subtitle}
            </Typography> : false}
          </div>
          <div className={classes.spacer} />
        </Toolbar>}
        <MuiTable className={classes.table} aria-labelledby="tableTitle">
          <TableHead>
            <TableRow className={classes.tableRowHead}>
              {headerCells.map(headerCell => {
                const {label, width, sortable, cellProps} = headerCell
                const { key, padding, numeric } = cellProps
                return (
                  <TableCell
                    {...cellProps}
                    style={width ? { width: width } : undefined}
                    sortDirection={orderBy === key ? order : false}
                  >
                    {sortable && <Tooltip title="Sort" placement="top-start" enterDelay={300}>
                      <TableSortLabel
                        active={orderBy === key}
                        direction={order}
                        onClick={e => this.handleRequestSort(key)}
                      >
                        <Typography variant="body2">
                          {label}
                        </Typography>
                      </TableSortLabel>
                    </Tooltip>}
                    {!sortable && <Typography variant="body2">
                      {label}
                    </Typography>}
                  </TableCell>
                );
              }, this)}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map(row => {
              return React.cloneElement(row, {className: classNames(classes.tableRow, row.props.className)},
                React.Children.map(row.props.children, cell => {
                  return React.cloneElement(cell, {className: classNames(classes.tableCell, row.props.className)})
                })
              )
            })/*.sort(getSorting(order, orderBy))*/}
            {// Now fill in rest of page with blank rows
            [...Array(rowsPerPage - Math.min(rowsPerPage, rowsData.length - page * rowsPerPage))]
            .map((row, index) => {
              return(
                <TableRow key={2147483647-index} className={classes.tableRow}>
                  <TableCell colSpan={headerCells.length} className={classes.tableCell}/>
                </TableRow>
              );
            })}
          </TableBody>
        </MuiTable>
        <TablePagination
          classes={{toolbar: classes.pagination}}
          component="div"
          count={rowsData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          rowsPerPageOptions={[rowsPerPage,]}
          backIconButtonProps={{
            'aria-label': 'Previous Page',
            style: {height: '32px'},
          }}
          nextIconButtonProps={{
            'aria-label': 'Next Page',
            style: {height: '32px'},
          }}
          onChangePage={this.handleChangePage}
        />
      </Paper>
    )
  }
}

Table.propTypes = {
  classes: PropTypes.object.isRequired,
  children: PropTypes.func.isRequired, //render prop
  fixedIndices: PropTypes.array.isRequired,
  headerCells: PropTypes.array.isRequired,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  rowsPerPage: PropTypes.number,
}

Table.defaultProps = {
  fixedIndices: [],
  initOrder: 'desc',
  rowsPerPage: 4,
  title: '',
  subtitle: '',
}

export default withStyles(styles)(Table)
