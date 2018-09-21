import React, { Component } from 'react'
import FullScreenDialogButtonSettings from './FullScreenDialogButtonSettings'
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import Tabs from '@material-ui/core/Tabs'
import Button from '@material-ui/core/Button'

const styles = theme => ({
  root: {
    flexGrow: 1,
  },
  toolbar: {
    minHeight: theme.spacing.unit * 6
  },
  flex: {
    flex: 1,
  },
  menuButton: {
    marginLeft: -12,
    marginRight: 20,
  },
})

class Nav extends Component {
  state = {
    open: false,
  };

  handleClickOpen = () => {
    this.setState({ open: true });
  };

  handleClose = () => {
    this.setState({ open: false });
  };

  render() {
    const { classes, tabIndex, children, onChangeTab } = this.props;
    const { open } = this.state;
    return (
      <div className={classes.root}>
        <AppBar position="static" className={classes.appBar}>
          <Toolbar className={classes.toolbar}>
            <Typography variant="title" color="inherit" className={classes.flex}>
              Gratiis
            </Typography>
            <FullScreenDialogButtonSettings />
          </Toolbar>
          <Tabs
            value={tabIndex}
            onChange={onChangeTab}
            fullWidth
          >

            {children}

          </Tabs>
        </AppBar>
      </div>
    )
  }
}

Nav.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Nav);
