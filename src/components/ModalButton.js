import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Modal from '@material-ui/core/Modal';
import Button from '@material-ui/core/Button';

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
    padding: theme.spacing(4),
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
