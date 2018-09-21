import strings from './api/strings'
import React from 'react';
import EnhancedTableToolbar from './EnhancedTableToolbar';
import EnhancedViewsTableHead from './EnhancedViewsTableHead';
import BrowserStorageContext from './BrowserStorageContext';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import { lighten } from '@material-ui/core/styles/colorManipulator';
import IconButton from '@material-ui/core/IconButton';
import DeleteOutlinedIcon from '@material-ui/icons/DeleteForeverOutlined';
import KeyboardArrowLeftIcon from '@material-ui/icons/KeyboardArrowLeft';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography'

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
    height: theme.spacing.unit * 5,
  },
  tableCell: {
    borderBottom: 0,
  },
  amount: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'baseline',
    //overflow: 'hidden'
  },
  buttonUnsubscribe: {
    padding: 0,
    width: '100%',
    minWidth: 0,
  },
  pagination: {
    height: theme.spacing.unit * 6,
    minHeight: 0,
  },
});

class SubscriptionsTable extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      order: 'desc',
      orderBy: 'share',
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

  handleChangePage = (event, page) => {
    this.setState({ page });
  };

  handleChangeRowsPerPage = event => {
    this.setState({ rowsPerPage: event.target.value });
  };

  render() {
    const { classes, budget, onViewProfile } = this.props;
    const { order, orderBy, rowsPerPage, page } = this.state;
    return (
      <BrowserStorageContext.Consumer>
        {({ state, removeFromSubs }) => <Paper className={classes.root}>
          <EnhancedTableToolbar numSelected={0} title="Monthly Subscriptions" subTitle={"next payment on " + Date(strings.paymentSchedule[state.settings.paymentSchedule](Date.now())).toString()}/>
          <Table className={classes.table} aria-labelledby="tableTitle">
            <EnhancedViewsTableHead
              order={order}
              orderBy={orderBy}
              onRequestSort={this.handleRequestSort}
              rowCount={state.subs.length}
            />
            <TableBody>
              {
                // slice() is required to deep copy state.subs before sorting
                state.subs.slice(0,1).concat( state.subs.slice(1).sort(getSorting(order, orderBy)) )
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map(n => {
                  const parts = n.hostname.split('.')
                  const siteUrl = parts[parts.length-2]+'.'+parts[parts.length-1]
                  const faviconUrl = 'https://' + siteUrl + '/apple-touch-icon.png'
                  const faviconUrlSmall = 'https://www.google.com/s2/favicons?domain=' + n.hostname
                  return (
                    <TableRow
                      className={classes.tableRow}
                      hover
                      tabIndex={-1}
                      key={n.id}
                    >
                      <TableCell
                        padding="none"
                        className={classes.tableCell}
                        onClick={event => onViewProfile(n.hostname)}
                      >
                        <Tooltip title="go to profile">
                          <Button className={classes.buttonUnsubscribe} size="small" aria-label="Launch">
                            <KeyboardArrowLeftIcon />
                            {
                              n.hostname.includes("#")
                              ? <AccountCircleIcon />
                              : <img src={faviconUrlSmall} height="16px" width="16px" style={{marginRight: '8px'}}/>
                            }
                          </Button>
                        </Tooltip>
                      </TableCell>
                      <TableCell
                        component="th"
                        scope="row"
                        padding="none"
                        className={classes.tableCell}
                        onClick={event => onViewProfile(n.hostname)}
                      >
                        <Tooltip title={n.hostname}>
                          <Typography variant="subheading">
                            {n.name}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell
                        padding="none"
                        className={classes.tableCell}
                      >
                        <Tooltip title={n.amount+' '+state.settings.currency+' per month'}>
                          <div className={classes.amount}>
                            <Typography variant="subheading">
                              {n.amount}
                            </Typography>
                             &nbsp;{strings.currency[state.settings.currency]}
                          </div>
                        </Tooltip>
                      </TableCell>
                      <TableCell padding="none" className={classes.tableCell}>
                        {(n.hostname !== "gratiis#mostViewedSites") && <Tooltip title="unsubscribe">
                          <Button
                            className={classes.buttonUnsubscribe}
                            onClick={e => removeFromSubs(n.hostname)}
                            size="small"
                            aria-label="Launch"
                          >
                            <DeleteOutlinedIcon />
                          </Button>
                        </Tooltip>}
                      </TableCell>
                    </TableRow>
                  );
                })}
              {// Now fill in rest of page with blank rows
              [...Array(rowsPerPage - Math.min(rowsPerPage, state.subs.length - page * rowsPerPage))]
              .map((row, index) => {
                return(
                  <TableRow key={2147483647-index} className={classes.tableRow}>
                    <TableCell colSpan={4} className={classes.tableCell}/>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <TablePagination
            classes={{toolbar: classes.pagination}}
            component="div"
            count={state.subs.length}
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
        </Paper>}
      </BrowserStorageContext.Consumer>
    );
  }
}

SubscriptionsTable.propTypes = {
  classes: PropTypes.object.isRequired,
  onViewProfile: PropTypes.func.isRequired,
};

export default withStyles(styles)(SubscriptionsTable);
