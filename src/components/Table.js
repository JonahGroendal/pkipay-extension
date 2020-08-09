import React from 'react'
import { makeStyles } from '@material-ui/styles'
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

const useStyles = makeStyles(theme => ({
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    paddingTop: theme.spacing(2),
    paddingRight: theme.spacing(2),
    paddingLeft: theme.spacing(2),
    minHeight:  theme.spacing(6)
  },
  table: {
    width: '100%',
    tableLayout: 'fixed'
  },
  tableRowHead: {
    height: theme.spacing(4)
  },
  titleComponentsContainer: {
    display: 'flex',
    alignItems: 'center'
  },
  titleComponentContainer: {
    marginLeft: theme.spacing(2)
  },
  tableRow: {
    height: theme.spacing(5)
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
    paddingLeft: theme.spacing(2) + ' !important'
  },
  tableCellNumeric: {
    paddingLeft: '0 !important'
  },
  tableCellLast: {
    paddingRight: theme.spacing(2) + ' !important'
  },
  tableCellBody: {
    borderBottom: 0
  },
  pagination: {
    height: theme.spacing(6),
    minHeight: 0
  }
}));

function sort(data, order, orderBy, fixedIndices) {
  function getSorting(order, orderBy) {
    return order === 'desc'
      ? (a, b) => (b[orderBy] < a[orderBy] ? -1 : 1)
      : (a, b) => (a[orderBy] < b[orderBy] ? -1 : 1);
  }
  let sortedData = data.filter((v, index) => !fixedIndices.includes(index))
  sortedData.sort(getSorting(order, orderBy))
  fixedIndices.forEach( index => {sortedData.splice(index, 0, data[index])} )
  return sortedData
}

function Table(props) {
  const {
    children,
    title='',
    subtitle='',
    headerCells,
    rowsData,
    fixedIndices=[],
    lastRow,
    rowsPerPage=4,
    highlightedRowIndex,
    titleComponents=[],
    initOrder='desc',
    initOrderBy
  } = props
  const classes = useStyles()
  const [order, setOrder] = React.useState(initOrder)
  const [orderBy, setOrderBy] = React.useState(initOrderBy)
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
  if (lastRow)
    rows.push(lastRow)
  const classCellDefault = classes.tableCell
  const classCellLast = classNames(classes.tableCell, classes.tableCellLast)
  const classCellNumeric = classNames(classes.tableCell, classes.tableCellNumeric)
  const classCellNumericLast = classNames(classes.tableCell, classes.tableCellNumeric, classes.tableCellLast)
  return (
    <Paper>
      {(!!title || !!subtitle || titleComponents.length > 0) && <Toolbar className={classes.toolbar}>
        <div className={classes.title}>
          <Typography variant="h6" id="tabletitle">
            {title}
          </Typography>
          {subtitle ? <Typography variant="body2">
            {subtitle}
          </Typography> : false}
        </div>
        <div className={classes.titleComponentsContainer}>
          {titleComponents.map((titleComponent, i) => (
            <div key={i} className={classes.titleComponentContainer}>
              {titleComponent}
            </div>
          ))}
        </div>
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
                      <Typography variant="body1">
                        {label}
                      </Typography>
                    </TableSortLabel>
                  </Tooltip>}
                  {!sortable && <Typography variant="body1">
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

export default Table
