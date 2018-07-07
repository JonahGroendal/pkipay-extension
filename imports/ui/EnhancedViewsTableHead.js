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

const tableHeadStyles = theme => ({
  nameColumn: {
    width: '34%'
  },
  shareColumn: {
    width: '17%',
  },
  durationColumn: {
    width: '25%'
  },
  viewsColumn: {
    width: '24%'
  }
})

class EnhancedViewsTableHead extends React.Component {
  createSortHandler = property => event => {
    this.props.onRequestSort(event, property);
  };

  columnData = [
    { id: 'name', numeric: false, padding: 'dense', label: 'Site', className: this.props.classes.nameColumn },
    { id: 'share', numeric: false, padding: 'dense', label: '%', className: this.props.classes.shareColumn },
    { id: 'duration', numeric: false, padding: 'dense', label: 'Time Spent', className: this.props.classes.durationColumn },
    { id: 'views', numeric: false, padding: 'dense', label: 'Views', className: this.props.classes.viewsColumn },
  ];

  render() {
    const { onSelectAllClick, order, orderBy, numSelected, rowCount } = this.props;

    return (
      <TableHead>
        <TableRow>
          {/* <TableCell padding="checkbox">
            <Checkbox
              indeterminate={numSelected > 0 && numSelected < rowCount}
              checked={numSelected === rowCount}
              onChange={onSelectAllClick}
            />
          </TableCell> */}
          {this.columnData.map(column => {
            return (
              <TableCell
              className={column.className}
                key={column.id}
                numeric={column.numeric}
                padding={column.padding}
                sortDirection={orderBy === column.id ? order : false}
              >
                <Tooltip
                  title="Sort"
                  placement="top-start"
                  enterDelay={300}
                >
                  <TableSortLabel
                    active={orderBy === column.id}
                    direction={order}
                    onClick={this.createSortHandler(column.id)}
                  >
                    {column.label}
                  </TableSortLabel>
                </Tooltip>
              </TableCell>
            );
          }, this)}
        </TableRow>
      </TableHead>
    );
  }
}

EnhancedViewsTableHead.propTypes = {
  numSelected: PropTypes.number.isRequired,
  onRequestSort: PropTypes.func.isRequired,
  onSelectAllClick: PropTypes.func.isRequired,
  order: PropTypes.string.isRequired,
  orderBy: PropTypes.string.isRequired,
  rowCount: PropTypes.number.isRequired,
};

export default withStyles(tableHeadStyles)(EnhancedViewsTableHead)
