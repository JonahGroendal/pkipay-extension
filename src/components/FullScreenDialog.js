import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import SettingsIcon from '@material-ui/icons/SettingsApplications';
import Dialog from '@material-ui/core/Dialog';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import CloseIcon from '@material-ui/icons/Close';
import Slide from '@material-ui/core/Slide';

const styles = {
  root: {
    maxWidth: '350px',
    maxHeight: '600px',
  },
  appBar: {
    position: 'relative',
  },
  flex: {
    flex: 1,
  },
};

const Transition = props => {
  return <Slide direction="up" {...props} />;
}

const FullScreenDialog = ({ classes, title, children, open, onClose, hideClose }) => (
  <Dialog
    className={classes.root}
    fullScreen
    open={open}
    onClose={onClose}
    TransitionComponent={Transition}
  >
    <AppBar className={classes.appBar}>
      <Toolbar>
        {!hideClose && <IconButton color="inherit" onClick={onClose} aria-label="Close">
          <CloseIcon />
        </IconButton>}
        <Typography variant="h6" color="inherit" className={classes.flex}>
          {title}
        </Typography>
      </Toolbar>
    </AppBar>

    {children}

  </Dialog>
);

FullScreenDialog.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(FullScreenDialog);
