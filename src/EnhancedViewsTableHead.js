import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import TableHead from '@material-ui/core/TableHead';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Tooltip from '@material-ui/core/Tooltip';
import Checkbox from '@material-ui/core/Checkbox';
import Typography from '@material-ui/core/Typography';

const styles = theme => ({
  toProfileColumn: {
    width: '20%'
  },
  nameColumn: {
    width: '46%'
  },
  shareColumn: {
    width: '20%'
  },
  unsubscribeColumn: {
    width: '14%'
  },
  tableRow: {
    height: theme.spacing.unit * 4
  },
  checkbox: {
    height: theme.spacing.unit * 3
  }
})

class EnhancedViewsTableHead extends React.Component {
  createSortHandler = property => event => {
    this.props.onRequestSort(event, property);
  };

  columnsAttributes = [
    { key: 'name', numeric: false, padding: 'none', label: 'Site', className: this.props.classes.nameColumn },
    { key: 'share', numeric: false, padding: 'none', label: 'Amount', className: this.props.classes.shareColumn },
    { key: 'toProfile', numeric: false, padding: 'none', label: '', className: this.props.classes.unsubscribeColumn },
  ];

  render() {
    const { classes, /*onSelectAllClick, */order, orderBy, /*numSelected, */rowCount } = this.props;

    return (
      <TableHead>
        <TableRow className={classes.tableRow}>
          <TableCell className={classes.toProfileColumn} padding="none">
            {/*<Checkbox
              className={classes.checkbox}
              indeterminate={numSelected > 0 && numSelected < rowCount}
              checked={numSelected ? numSelected === rowCount : false}
              onChange={onSelectAllClick}
            />*/}
          </TableCell>
          {this.columnsAttributes.map(colAttrs => {
            let {label, ...attributes} = colAttrs
            return (
              <TableCell
                {...attributes}
                sortDirection={orderBy === colAttrs.key ? order : false}
              >
                {attributes.key !== 'toProfile' && <Tooltip
                  title="Sort"
                  placement="top-start"
                  enterDelay={300}
                >
                  <TableSortLabel
                    active={orderBy === colAttrs.key}
                    direction={order}
                    onClick={this.createSortHandler(colAttrs.key)}
                  >
                    <Typography variant="body2">
                      {label}
                    </Typography>
                  </TableSortLabel>
                </Tooltip>}
              </TableCell>
            );
          }, this)}
        </TableRow>
      </TableHead>
    );
  }
}

EnhancedViewsTableHead.propTypes = {
  //numSelected: PropTypes.number.isRequired,
  onRequestSort: PropTypes.func.isRequired,
  //onSelectAllClick: PropTypes.func.isRequired,
  order: PropTypes.string.isRequired,
  orderBy: PropTypes.string.isRequired,
  rowCount: PropTypes.number.isRequired,
};

export default withStyles(styles)(EnhancedViewsTableHead)
