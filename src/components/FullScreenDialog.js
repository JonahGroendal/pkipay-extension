import React from 'react';
import { makeStyles } from '@material-ui/styles'
import IconButton from '@material-ui/core/IconButton';
import Dialog from '@material-ui/core/Dialog';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import CloseIcon from '@material-ui/icons/Close';
import Slide from '@material-ui/core/Slide';

const useStyles = makeStyles(theme => ({
  root: {
    maxWidth: '352px', // theme.spacing(44)
    maxHeight: '600px', // theme.spacing(75)
  },
  appBar: {
    position: 'relative',
  },
  flex: {
    flex: 1,
  }
}));

const Transition = props => {
  return <Slide direction="up" {...props} />;
}

function FullScreenDialog({ title, children, open, onClose, hideClose }) {
  const classes = useStyles();

  return (
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
}

export default FullScreenDialog;
