import React from 'react';
import EnhancedTableToolbar from './EnhancedTableToolbar';
import EnhancedViewsTableHead from './EnhancedViewsTableHead';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Checkbox from '@material-ui/core/Checkbox';
import Button from '@material-ui/core/Button';
import { lighten } from '@material-ui/core/styles/colorManipulator';
import IconButton from '@material-ui/core/IconButton';
import LaunchIcon from '@material-ui/icons/Launch';
import Tooltip from '@material-ui/core/Tooltip';

function getSorting(order, orderBy) {
  return order === 'desc'
    ? (a, b) => (b[orderBy] < a[orderBy] ? -1 : 1)
    : (a, b) => (a[orderBy] < b[orderBy] ? -1 : 1);
}

const styles = theme => ({
  root: {
    width: '100%',
    marginTop: theme.spacing.unit * 2,
  },
  table: {
    width: '100%',
    tableLayout: 'fixed',
  },
  tableRow: {
    height: theme.spacing.unit * 4,
  },
  tableCell: {
    borderBottom: 0,
  },
  checkbox: {
    height: theme.spacing.unit * 3,
  },
  profileButton: {
    width: '100%',
    minWidth: 0,
  },
  pagination: {
    height: theme.spacing.unit * 6,
    minHeight: 0,
  },
});

class EnhancedViewsTable extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      order: 'desc',
      orderBy: 'share',
      selected: [],
      page: 0,
      rowsPerPage: 4,
    };
  }

  handleRequestSort = (event, property) => {
    const orderBy = property;
    let order = 'desc';

    if (this.state.orderBy === property && this.state.order === 'desc') {
      order = 'asc';
    }

    this.setState({ order, orderBy });
  };

  handleSelectAllClick = (event, checked) => {
    if (checked) {
      this.setState({ selected: this.props.views.map(n => n.id) });
      return;
    }
    this.setState({ selected: [] });
  };

  handleClick = (event, id) => {
    const { selected } = this.state;
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }
    console.log(newSelected)
    this.setState({ selected: newSelected });
  };

  handleChangePage = (event, page) => {
    this.setState({ page });
  };

  handleChangeRowsPerPage = event => {
    this.setState({ rowsPerPage: event.target.value });
  };

  isSelected = id => this.state.selected.indexOf(id) !== -1;

  render() {
    const { classes, views, budget } = this.props;
    const { order, orderBy, selected, rowsPerPage, page } = this.state;
    const emptyRows = rowsPerPage - Math.min(rowsPerPage, views.length - page * rowsPerPage);
    return (
      <Paper className={classes.root}>
        <EnhancedTableToolbar numSelected={selected.length} title="This Month" />
          <Table className={classes.table} aria-labelledby="tableTitle">
            <EnhancedViewsTableHead
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={this.handleSelectAllClick}
              onRequestSort={this.handleRequestSort}
              rowCount={views.length}
            />
            <TableBody>
              {
                views.slice().sort(getSorting(order, orderBy))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map(n => {
                  const share = '$'+(n.share*budget/100).toFixed(2)+' ('+n.share+'%)'
                  const isSelected = this.isSelected(n.id)
                  const parts = n.hostname.split('.')
                  const siteUrl = parts[parts.length-2]+'.'+parts[parts.length-1]
                  const faviconUrl = 'https://' + siteUrl + '/apple-touch-icon.png'
                  const faviconUrlSmall = 'https://www.google.com/s2/favicons?domain=' + n.hostname
                  return (
                    <TableRow
                      className={classes.tableRow}
                      hover
                      role="checkbox"
                      aria-checked={isSelected}
                      tabIndex={-1}
                      key={n.id}
                      selected={isSelected}
                    >
                      <TableCell
                        padding="none"
                        className={classes.tableCell}
                        onClick={event => this.handleClick(event, n.id)}
                      >
                        <Checkbox checked={isSelected} className={classes.checkbox} />
                      </TableCell>
                      <TableCell
                        component="th"
                        scope="row"
                        padding="none"
                        className={classes.tableCell}
                        onClick={event => this.handleClick(event, n.id)}
                      >
                        <Tooltip title={n.hostname}>
                          <div>
                            <img src={faviconUrlSmall} height="16px" width="16px" style={{marginRight: '8px'}}/>
                            {n.name}
                          </div>
                        </Tooltip>
                      </TableCell>
                      <TableCell
                        padding="none"
                        className={classes.tableCell}
                        onClick={event => this.handleClick(event, n.id)}
                      >
                        {share}
                      </TableCell>
                      <TableCell padding="none" className={classes.tableCell}>
                        <Button className={classes.profileButton} size="small" aria-label="Launch">
                          <LaunchIcon />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              {[...Array(emptyRows)].map(row => {
                return(
                  <TableRow className={classes.tableRow}>
                    <TableCell colSpan={4} className={classes.tableCell}/>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        <TablePagination
          classes={{toolbar: classes.pagination}}
          component="div"
          count={views.length}
          rowsPerPage={rowsPerPage}
          page={page}
          rowsPerPageOptions={[4,]}
          backIconButtonProps={{
            'aria-label': 'Previous Page',
            style: {height: '32px'},
          }}
          nextIconButtonProps={{
            'aria-label': 'Next Page',
            style: {height: '32px'},
          }}
          onChangePage={this.handleChangePage}
          onChangeRowsPerPage={this.handleChangeRowsPerPage}
        />
      </Paper>
    );
  }
}

EnhancedViewsTable.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(EnhancedViewsTable);
