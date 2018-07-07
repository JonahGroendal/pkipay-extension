import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Modal from '@material-ui/core/Modal';
import Button from '@material-ui/core/Button';

function rand() {
  return Math.round(Math.random() * 20) - 10;
}

function getModalStyle() {
  const top = 50 + rand();
  const left = 50 + rand();

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  };
}

const styles = theme => ({
  root: {
    display: 'inline-block'
  },
  paper: {
    position: 'absolute',
    top: '30%',
    width: '343px',
    left: '3px',
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing.unit * 4,
  },
});

class ModalButton extends React.Component {
  state = {
    open: false,
  };

  handleOpen = () => {
    this.setState({ open: true });
  };

  handleClose = () => {
    this.setState({ open: false });
  };

  render() {
    const { classes, text, ...buttonProps } = this.props;

    return (
      <div className={classes.root}>
        <Button onClick={this.handleOpen} {...buttonProps}>{text}</Button>
        <Modal
          open={this.state.open}
          onClose={this.handleClose}
        >
          <div className={classes.paper}>

            {this.props.children}

          </div>
        </Modal>
      </div>
    );
  }
}

ModalButton.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(ModalButton);
