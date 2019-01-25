import React from 'react'
import FullScreenDialog from './FullScreenDialog'
import { withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import IconButton from '@material-ui/core/IconButton'
import PaymentIcon from '@material-ui/icons/Payment'
import SendIcon from '@material-ui/icons/Send'
import Tooltip from '@material-ui/core/Tooltip'
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import Divider from '@material-ui/core/Divider';
import CircularProgress from '@material-ui/core/CircularProgress';
import DoneIcon from '@material-ui/icons/Done';
import ErrorIcon from '@material-ui/icons/Error';
import Badge from '@material-ui/core/Badge';

function TransactionScreen(props) {
  const {
    isOpen,
    counterparties,
    values,
    gasValue,
    gasValueETH,
    txSent,
    txConfirmed,
    txErrored,
    onClickSend,
    onClickCancel,
    onClickClose,
    onClickOpen,
    currencySymbol,
    badgeInvisible,
    classes,
  } = props;

  const totalAmount = values.reduce( (a, b) => a + b, 0 )
  return (
    <div>
      <IconButton
        onClick={e => { if (isOpen) onClickClose(); else onClickOpen()}}
        color="inherit"
        aria-label="Review Transaction"
      >
        <Tooltip title="last transaction">
          <Badge
            invisible={badgeInvisible}
            badgeContent="!" color="secondary"
          >
            <PaymentIcon />
          </Badge>
        </Tooltip>
      </IconButton>
      <FullScreenDialog
        title={"Review Transaction"}
        open={isOpen}
        onClose={onClickClose}
      >
        <div className={classes.contentRoot}>
          <div className={classes.currentTransaction}>
            <div className={classes.details}>
              <Typography variant="title">
                Details
              </Typography>
              <List className={classes.list}>
                {counterparties.map((to, index) => (
                  <ListItem
                    key={index}
                    divider={index !== counterparties.length-1}
                  >
                    <div className={classes.listItemLeft}>
                      <div className={classes.listItemValue}>
                        <ListItemText primary={currencySymbol + values[index].toFixed(2) + " DAI"} />
                        <ListItemIcon>
                          <ArrowForwardIcon />
                        </ListItemIcon>
                      </div>
                      <div className={classes.listItemValue}>
                        <ListItemText primary={currencySymbol + values[index].toFixed(2) + " THX"} />
                        <ListItemIcon>
                          <ArrowBackIcon />
                        </ListItemIcon>
                      </div>
                    </div>
                    <Tooltip title={to}>
                      <ListItemText primary={Array.from(to.substring(0, 17)).map((c, i) => i!==16 ? c : String.fromCharCode(8230)).join('')} />
                    </Tooltip>
                  </ListItem>
                ))}
              </List>
            </div>
            <Divider />
            <div className={classes.summary}>
              <div className={classes.summaryRow}>
                <Typography variant="subheading">
                  {"Transfers"}
                </Typography>
                <Typography variant="subheading">
                  {currencySymbol + totalAmount.toFixed(2)}
                </Typography>
              </div>
              <div className={classes.summaryRow}>
                <Typography variant="subheading">
                  {"Network fees"}
                </Typography>
                <Typography variant="subheading">
                  {(gasValueETH*1000).toFixed(3) + "mETH (" + currencySymbol + gasValue.toFixed(2) + ")"}
                </Typography>
              </div>
              <div className={classes.summaryRow}>
                <Typography variant="subheading">
                  {"Total:"}
                </Typography>
                <Typography variant="subheading">
                  {currencySymbol + (totalAmount + gasValue).toFixed(2)}
                </Typography>
              </div>
            </div>
            <Divider />
            <div className={classes.statusAndButtons}>
              <div className={classes.statuses}>
                {txSent && !txConfirmed && !txErrored && <div classname={classes.status}>
                  <Typography variant="subheading">
                    {"Transaction pending "}
                  </Typography>
                  <CircularProgress />
                </div>}
                {txSent && txConfirmed && <div className={classes.status}>
                  <Typography variant="subheading">
                    {"Transaction confirmed "}
                  </Typography>
                  <DoneIcon />
                </div>}
                {txSent && txErrored && <div className={classes.status}>
                  <Typography variant="subheading">
                    {"Transaction errored "}
                  </Typography>
                  <ErrorIcon />
                </div>}
              </div>
              {!txSent && <div className={classes.buttons}>
                <Button
                  onClick={onClickCancel}
                  variant="outlined" size="medium"color="primary"
                >
                  Cancel
                </Button>
                <Button
                  onClick={onClickSend}
                  variant="contained" size="medium" color="secondary"
                >
                  Send
                  <SendIcon className={classes.rightIcon} />
                </Button>
              </div>}
            </div>
          </div>
          <div className={classes.transactionsHistory}>
          </div>
        </div>
      </FullScreenDialog>
    </div>
  )
}

const styles = theme => ({
  contentRoot: {
    backgroundColor: theme.palette.background.default
  },
  currentTransaction: {
    height: '70%',
    display: 'flex',
    flexDirection: 'column'
  },
  list: {
    //backgroundColor: theme.palette.background.paper
  },
  details: {
    display: 'flex',
    flexDirection: 'column',
    paddingTop: theme.spacing.unit * 2,
    paddingRight: theme.spacing.unit * 2,
    paddingBottom: theme.spacing.unit * 2,
    paddingLeft: theme.spacing.unit * 2,
  },
  statusAndButtons: {
    paddingTop: theme.spacing.unit * 2,
    paddingRight: theme.spacing.unit * 2,
    paddingBottom: theme.spacing.unit * 2,
    paddingLeft: theme.spacing.unit * 2,
  },
  status: {
    display: 'flex',
  },
  summary: {
    display: 'flex',
    flexDirection: 'column',
    paddingTop: theme.spacing.unit * 1,
    paddingRight: theme.spacing.unit * 2,
    paddingBottom: theme.spacing.unit * 2,
    paddingLeft: theme.spacing.unit * 2,
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    paddingTop: theme.spacing.unit * 1,
    paddingRight: theme.spacing.unit * 2,
    paddingLeft: theme.spacing.unit * 2,
  },
  buttons: {
    display: 'flex',
    justifyContent: 'space-around',
  },
  badge: {
    margin: theme.spacing.unit * 2,
  },
  listItemLeft: {
    display: 'flex',
    flexDirection: 'column',
    width: theme.spacing.unit * 19,
  },
  listItemValue: {
    display: 'flex',
    flexDirection: 'row'
  },
  rightIcon: {
    marginLeft: theme.spacing.unit,
  },
})
export default withStyles(styles)(TransactionScreen)
