import React from 'react'
import { makeStyles } from '@material-ui/styles'
import FullScreenDialog from './FullScreenDialog'
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

const useStyles = makeStyles(theme => ({
  contentRoot: {},
  currentTransaction: {
    height: '70%',
    display: 'flex',
    flexDirection: 'column'
  },
  noTx: {
    marginLeft: theme.spacing(2),
    marginTop: theme.spacing(2)
  },
  details: {
    display: 'flex',
    flexDirection: 'column',
    paddingTop: theme.spacing(2),
    paddingRight: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    paddingLeft: theme.spacing(2),
  },
  statusAndButtons: {
    paddingTop: theme.spacing(2),
    paddingRight: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    paddingLeft: theme.spacing(2),
  },
  status: {
    paddingTop: theme.spacing(4),
    display: 'flex',
    justifyContent: 'space-around'
  },
  summary: {
    display: 'flex',
    flexDirection: 'column',
    paddingTop: theme.spacing(1),
    paddingRight: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    paddingLeft: theme.spacing(2),
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    paddingTop: theme.spacing(1),
    paddingRight: theme.spacing(2),
    paddingLeft: theme.spacing(2),
  },
  buttons: {
    display: 'flex',
    justifyContent: 'space-around',
  },
  badge: {
    margin: theme.spacing(2),
  },
  listItemLeft: {
    display: 'flex',
    flexDirection: 'column',
    width: theme.spacing(19),
  },
  listItemValue: {
    display: 'flex',
    flexDirection: 'row'
  },
  rightIcon: {
    marginLeft: theme.spacing(1),
  }
}));

function TransactionScreen(props) {
  const {
    isOpen,
    counterparties,
    values,
    gasValue,
    gasValueETH,
    gasValueIsApproximation,
    txSent,
    txConfirmed,
    txErrored,
    txReverted,
    onClickSend,
    onClickCancel,
    onClickClose,
    onClickOpen,
    currencySymbol,
    badgeInvisible,
    txObjectExists,
    invalidCounterpartyExists
  } = props;
  const classes = useStyles()

  let balancesChanges = { 'ETH': 0 }
  values.forEach(valsObj => {
    Object.keys(valsObj).forEach(tokenLabel => {
      if (typeof balancesChanges[tokenLabel] !== 'number')
        balancesChanges[tokenLabel] = 0
      balancesChanges[tokenLabel] += valsObj[tokenLabel]
    })
  })
  return (
    <div>
      <IconButton
        onClick={e => { if (isOpen) onClickClose(); else onClickOpen()}}
        color="inherit"
        aria-label="Review Transaction"
      >
        <Tooltip title="last transaction" enterDelay={300}>
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
              <Typography variant="h6">
                Details
              </Typography>
              {!txObjectExists && <Typography variant="subtitle1"className={classes.noTx}>
                No transaction
              </Typography>}
              {txObjectExists && <List>
                {counterparties.map((to, index) => (
                  <ListItem
                    key={index}
                    divider={index !== counterparties.length-1}
                  >
                    <div className={classes.listItemLeft}>
                      {Object.keys(values[index]).map(tokenLabel => (
                        <div key={tokenLabel} className={classes.listItemValue}>
                          <ListItemText primary={Math.abs(values[index][tokenLabel]).toFixed(3) + " " + tokenLabel} />
                          <ListItemIcon>
                            {values[index][tokenLabel] <= 0
                              ? <ArrowForwardIcon />
                              : <ArrowBackIcon />}
                          </ListItemIcon>
                        </div>
                      ))}
                    </div>
                    <Tooltip title={to} enterDelay={300}>
                      <ListItemText primary={Array.from(to.replace('.dnsroot.eth', '').replace('.dnsroot.test', '').substring(0, 17)).map((c, i) => i!==16 ? c : String.fromCharCode(8230)).join('')} />
                    </Tooltip>
                  </ListItem>
                ))}
              </List>}
            </div>
            <Divider />
            <div className={classes.summary}>
              <div className={classes.summaryRow}>
                <Typography variant="subtitle1">
                  {"Network fees:"}
                </Typography>
                <Typography variant="subtitle1">
                  {(gasValueIsApproximation ? "<" : "").concat((gasValueETH*1000).toFixed(3), "mETH", gasValue > 0 ? " (".concat(currencySymbol, gasValue.toFixed(2), ")") : "")}
                </Typography>
              </div>
              <div className={classes.summaryRow}>
                <Typography variant="subtitle1">
                  {"Total change:"}
                </Typography>
                <div>
                  <Typography variant="subtitle1">
                    {(balancesChanges['ETH'] - gasValueETH >= 0 ? '+ ' : '– ').concat(Math.abs(balancesChanges['ETH'] - gasValueETH).toFixed(6), " ETH")}
                  </Typography>
                  {Object.keys(balancesChanges).filter(k => k !== 'ETH').map(tokenLabel => (
                    <Typography key={tokenLabel} variant="subtitle1">
                      {(balancesChanges[tokenLabel] >= 0 ? '+ ' : '– ').concat(Math.abs(balancesChanges[tokenLabel]).toFixed(6), " ", tokenLabel)}
                    </Typography>
                  ))}
                </div>
              </div>
            </div>
            <Divider />
            <div className={classes.statusAndButtons}>
              <div className={classes.buttons}>
                <Button
                  onClick={onClickCancel}
                  variant="outlined" size="medium"color="primary"
                  disabled={txSent && !txErrored && !txReverted}
                >
                  Cancel
                </Button>
                <Tooltip
                  title={invalidCounterpartyExists ? "Invalid counterparty" : ""}
                  enterDelay={300}
                >
                  <div> {/* div is here so tooltip works when button is disabled */}
                    <Button
                      onClick={onClickSend}
                      variant="contained" size="medium" color="secondary"
                      disabled={!txObjectExists || txSent || invalidCounterpartyExists}
                    >
                      Send
                      <SendIcon className={classes.rightIcon} />
                    </Button>
                  </div>
                </Tooltip>
              </div>
              {txSent && !txConfirmed && !txErrored && !txReverted && <div className={classes.status}>
                <Typography variant="subtitle1">
                  {"Transaction pending "}
                </Typography>
                <CircularProgress />
              </div>}
              {txSent && txConfirmed && <div className={classes.status}>
                <Typography variant="subtitle1">
                  {"Transaction confirmed "}
                </Typography>
                <DoneIcon />
              </div>}
              {txSent && txErrored && <div className={classes.status}>
                <Typography variant="subtitle1">
                  {"Transaction errored "}
                </Typography>
                <ErrorIcon />
              </div>}
              {txSent && txReverted && <div className={classes.status}>
                <Typography variant="subtitle1">
                  {"Transaction reverted "}
                </Typography>
                <ErrorIcon />
              </div>}
            </div>
          </div>
        </div>
      </FullScreenDialog>
    </div>
  )
}

export default TransactionScreen
