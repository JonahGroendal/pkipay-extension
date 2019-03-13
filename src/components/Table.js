import React from 'react'
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
  toolbar: {
    paddingTop: theme.spacing.unit * 2,
    paddingRight: theme.spacing.unit * 2,
    paddingLeft: theme.spacing.unit * 2,
    minHeight:  theme.spacing.unit * 6
  },
  table: {
    width: '100%',
    tableLayout: 'fixed'
  },
  tableRowHead: {
    height: theme.spacing.unit * 4
  },
  tableRow: {
    height: theme.spacing.unit * 5
  },
  highlighted: {
    animationName: 'highlight',
    animationDuration: '2s',
    animationDelay: '.2s'
  },
  '@keyframes highlight': {
    '0%':   {backgroundColor: 'rgba(0, 0 , 0, 0)'},
    '50%':  {backgroundColor: theme.palette.action.selected},
    '100%': {backgroundColor: 'rgba(0, 0 , 0, 0)'}
  },
  tableCell: {
    paddingLeft: theme.spacing.unit * 2 + ' !important'
  },
  tableCellNumeric: {
    paddingLeft: '0 !important'
  },
  tableCellLast: {
    paddingRight: theme.spacing.unit * 2 + ' !important'
  },
  tableCellBody: {
    borderBottom: 0
  },
  pagination: {
    height: theme.spacing.unit * 6,
    minHeight: 0
  }
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

function Table(props) {
  const {
    classes,
    children,
    title,
    subtitle,
    headerCells,
    rowsData,
    fixedIndices,
    rowsPerPage,
    highlightedRowIndex
  } = props

  const [order, setOrder] = React.useState(props.initOrder)
  const [orderBy, setOrderBy] = React.useState(props.initOrderBy)
  const rowsDataSorted = sort(rowsData, order, orderBy, fixedIndices)
  const [page, setPage] = React.useState(0)
  const stortedIndex = rowsDataSorted.findIndex(row => row === rowsData[highlightedRowIndex])

  React.useEffect(() => {
    if (highlightedRowIndex > -1)
      setPage(Math.floor(stortedIndex/rowsPerPage))
  }, [highlightedRowIndex])

  function handleRequestSort(property) {
    let newOrder = 'desc'
    if (orderBy === property && order === 'desc') {
      newOrder = 'asc'
    }
    setOrderBy(property)
    setOrder(newOrder)
  }

  function handleChangePage(event, page) {
    setPage(page)
  }

  const rows = rowsDataSorted.map(children) //`children` is a render prop
  const classCellDefault = classes.tableCell
  const classCellLast = classNames(classes.tableCell, classes.tableCellLast)
  const classCellNumeric = classNames(classes.tableCell, classes.tableCellNumeric)
  const classCellNumericLast = classNames(classes.tableCell, classes.tableCellNumeric, classes.tableCellLast)
  return (
    <Paper>
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
      <MuiTable className={classes.table} padding="none" aria-labelledby="tableTitle">
        <TableHead>
          <TableRow className={classes.tableRowHead}>
            {headerCells.map((headerCell, index, array) => {
              const { label, width, sortable, cellProps } = headerCell
              const { key, numeric } = cellProps
              return (
                <TableCell
                  className={index === array.length-1 ? (numeric ? classCellNumericLast : classCellLast) : (numeric ? classCellNumeric : classCellDefault)}
                  key={key}
                  align={numeric ? 'right' : 'inherit'}
                  style={width ? { width: width } : undefined}
                  sortDirection={orderBy === key ? order : false}
                >
                  {sortable && <Tooltip title="Sort" placement="top-start" enterDelay={300}>
                    <TableSortLabel
                      active={orderBy === key}
                      direction={order}
                      onClick={e => handleRequestSort(key)}
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
            })}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, i) => {
            return React.cloneElement(row, {className: (page*rowsPerPage+i === stortedIndex) ? classNames(classes.tableRow, classes.highlighted, row.props.className) : classNames(classes.tableRow, row.props.className)},
              React.Children.map(row.props.children, (cell, index) => {
                return React.cloneElement(cell, {className: (index === React.Children.count(row.props.children)-1 ? classNames(classes.tableCell, classes.tableCellLast, classes.tableCellBody, row.props.className) : classNames(classes.tableCell, classes.tableCellBody, row.props.className))})
              })
            )
          })/*.sort(getSorting(order, orderBy))*/}
          {// Now fill in rest of page with blank rows
          [...Array(rowsPerPage - Math.min(rowsPerPage, rowsData.length - page * rowsPerPage))]
          .map((row, index) => {
            return(
              <TableRow key={2147483647-index} className={classes.tableRow}>
                <TableCell colSpan={headerCells.length} className={classNames(classes.tableCell, classes.tableCellBody)}/>
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
        }}
        nextIconButtonProps={{
          'aria-label': 'Next Page',
        }}
        onChangePage={handleChangePage}
      />
    </Paper>
  )
}

function usePrevious(value) {
  const ref = React.useRef();
  React.useEffect(() => {
    ref.current = value;
  });
  return ref.current;
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
