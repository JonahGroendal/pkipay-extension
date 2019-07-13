import React from 'react'
import { makeStyles } from '@material-ui/core/styles';
import classNames from 'classnames';
import FullScreenDialog from './FullScreenDialog'
import Link from '@material-ui/core/Link';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import StepContent from '@material-ui/core/StepContent';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Tooltip from '@material-ui/core/Tooltip';
import CircularProgress from '@material-ui/core/CircularProgress';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import Select from '@material-ui/core/Select';
import Input from '@material-ui/core/Input';
import FormControl from '@material-ui/core/FormControl';
import Slide from '@material-ui/core/Slide';
import OpenInBrowserIcon from '@material-ui/icons/OpenInBrowser';
import Snackbar from '@material-ui/core/Snackbar';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';

const instructions = {
  "Godaddy":   "https://www.godaddy.com/help/add-a-txt-record-19232",
  "Google":    "https://support.google.com/domains/answer/3290350?hl=en&ref_topic=9018335",
  "Name.com":  "https://www.name.com/support/articles/115004972547-Adding-a-TXT-Record",
  "Bluehost":  "https://my.bluehost.com/hosting/help/559#add",
  "Hostgator": "https://support.hostgator.com/articles/manage-dns-records-with-hostgatorenom",
  "Namecheap": "https://www.namecheap.com/support/knowledgebase/article.aspx/317/2237/how-do-i-add-txtspfdkimdmarc-records-for-my-domain",
  "Dreamhost": "https://help.dreamhost.com/hc/en-us/articles/215414867-How-do-I-add-custom-DNS-records-",
  "Shopify":   "https://help.shopify.com/en/manual/domains/managing-domains/advanced-settings#view-or-edit-the-dns-settings-for-a-domain",
  "Ionos":     "https://www.ionos.com/help/domains/configuring-txt-and-srv-records/adding-editing-or-removing-txt-records/",
  "Hover":     "https://help.hover.com/hc/en-us/articles/217282457-How-to-Edit-DNS-records-A-AAAA-CNAME-MX-TXT-SRV-",
  "Dynadot":   "https://www.dynadot.com/community/help/question/create-TXT-record",
  "Enom":      "https://www.enom.com/kb/kb/kb_0488-add-spf-txt-records.htm",
  "Other":     ""
}

const useStyles = makeStyles(theme => ({
  root: {
    paddingRight: theme.spacing(1),
    overflow: 'hidden'
  },
  button: {
    marginTop: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
  actionsContainer: {},
  resetContainer: {
    padding: theme.spacing(3),
  },
  buttonProgress: {
    position: 'absolute',
  },
  registrar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(1)
  },
  registrarSelect: {
    width: theme.spacing(15)
  },
  registrarLink: {
    // marginLeft: theme.spacing(2)
  },
  registrarLinkIcon: {
    marginLeft: theme.spacing(1)
  },
  recordValue: {
    width: theme.spacing(18),
    height: theme.spacing(4),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer'
  },
  shortRecordValue: {
    width: theme.spacing(6),
    marginLeft: theme.spacing(1)
  },
  recordRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(1),
  },
  recordRowLast: {
    justifyContent: 'space-around'
  },
  recordRowItem: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center'
  },
  typography: {
    fontFamily: '"Courier New"',
    fontSize: '0.875rem',
    '-webkit-user-select': 'none', /* Safari */
    '-moz-user-select': 'none', /* Firefox */
    '-ms-user-select': 'none', /* IE10+/Edge */
    'user-select': 'none' /* Standard */
  }
}));

const steps = [{
  label: "Primer",
  text:  `To register as the owner of this website and withdraw your
          donations, you must demonstrate your control of the domain by setting a
          DNS record. Navigating to your domain name registrar's website will
          close this app, but don't worry, you can always re-open it to continue
          where you left off.`
}, {
  label: "DNS challenge",
  text:  `Log in to your registrar's website and add a record with the below
          information, then wait two minutes before submitting.`
}, {
  label: "Send proof",
  text:  `Finally, a proof will be uploaded to the
          blockchain. This will debit a small amount of ETH
          from your account (typically less than 1 USD's worth).`
}]

export default function DnsChallengeScreen(props) {
  const {
    open, domainName, recordName, recordText,
    initStepIndex, onClose, onReset,
    onStepComplete: handleStepComplete,
    onClickLink: handleClickLink,
    onCopy: handleCopy,
  } = props;
  const classes = useStyles();
  const [activeStep, setActiveStep] = React.useState(initStepIndex);
  const [numCompletedSteps, setNumCompletedSteps] = React.useState(initStepIndex);
  const [errorIndex, setErrorIndex] = React.useState(-1);
  const [errorMsg, setErrorMsg] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [registrar, setRegistrar] = React.useState('');
  const [registrarLinkVisible, setRegistrarLinkVisible] = React.useState(false);
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const recordType = 'TXT';
  const recordTtl = '300';

  function resetState() {
    setActiveStep(0);
    setNumCompletedSteps(0);
    setRegistrar('');
    setRegistrarLinkVisible(false);
    setErrorIndex(-1);
    setErrorMsg('');
  }

  function handleReset() {
    resetState();
    onReset();
  }

  function handleClose() {
    resetState();
    onClose();
  }

  async function handleNext(stepIndex) {
    if (numCompletedSteps === stepIndex) {
      setLoading(true);
      try {
        await handleStepComplete(stepIndex);
        setNumCompletedSteps(stepIndex + 1);
        setActiveStep(stepIndex + 1);
      } catch (error) {
        if (!error.message.includes('Wallet unlock canceled')) {
          if (error.message.includes('not acceptable for finalization')) {
            setErrorMsg('Challenge failed');
          } else {
            console.error(error);
            setErrorMsg(error.message);
          }
          setErrorIndex(stepIndex);
        }
      }
      setLoading(false);
    } else {
      setActiveStep(stepIndex + 1);
    }
  }

  function handleBack() {
    setActiveStep(prevActiveStep => prevActiveStep - 1);
  }

  async function handleChangeRegistrar(event) {
    event.preventDefault();
    setRegistrar(event.target.value);
    if (!registrarLinkVisible) {
      await new Promise(resolve => setTimeout(resolve, 400));
      setRegistrarLinkVisible(true);
    }
  }

  function handleClickRecordName() {
    handleCopy(recordName);
    setSnackbarOpen(true);
  }

  function handleClickRecordText() {
    handleCopy(recordText);
    setSnackbarOpen(true);
  }

  function handleClickRecordType() {
    handleCopy(recordType);
    setSnackbarOpen(true);
  }

  function handleClickRecordTtl() {
    handleCopy(recordTtl);
    setSnackbarOpen(true);
  }

  function handleCloseSnackbar(event, reason) {
    if (reason === 'clickaway') return;
    setSnackbarOpen(false);
  }

  function getButtonLabel(stepIndex) {
    switch (stepIndex) {
      case 1:
        return 'Submit';
      case 2:
        return 'Send';
      default:
        return 'Next';
    }
  }

  return (
    <FullScreenDialog
      title={`Claim ${domainName}`}
      open={open}
      onClose={handleClose}
    >
      <div className={classes.root}>
        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((step, stepIndex) => (
            <Step key={step.label} completed={stepIndex < numCompletedSteps}>
              <StepLabel
                error={errorIndex === stepIndex}
                optional={errorIndex === stepIndex
                  ? (<Typography variant="caption" color="error">
                        {errorMsg}
                    </Typography>)
                  : undefined
                }
              >
                {step.label}
              </StepLabel>
              <StepContent>
                <div>
                  <div>
                    <Typography>
                      {step.text}
                    </Typography>
                    {stepIndex === 1 && (
                      <React.Fragment>
                        <div className={classes.registrar}>
                          <FormControl className={classes.registrarSelect}>
                            <InputLabel htmlFor="domain-registrar">Registrar</InputLabel>
                            <Select
                              value={registrar}
                              onChange={handleChangeRegistrar}
                              input={<Input name="domain registrar" id="domain-registrar" />}
                            >
                              <MenuItem value="">
                                <em>None</em>
                              </MenuItem>
                              {Object.keys(instructions).map(domain => (
                                <MenuItem value={domain}>{domain}</MenuItem>
                              ))}
                            </Select>
                            <FormHelperText>Where'd you buy your domain?</FormHelperText>
                          </FormControl>
                          <Slide
                            in={registrarLinkVisible}
                            className={classes.registrarLink}
                            direction="left"
                            mountOnEnter unmountOnExit
                          >
                            <Button
                              onClick={() => handleClickLink(instructions[registrar])}
                              variant="outlined"
                            >
                              Help
                              <OpenInBrowserIcon className={classes.registrarLinkIcon}/>
                            </Button>
                          </Slide>
                        </div>
                        <div className={classes.recordRow}>
                          <Typography >
                            Name/Host:
                          </Typography>
                          <Tooltip title="copy text">
                            <Paper onClick={handleClickRecordName} className={classes.recordValue}>
                              <Typography className={classes.typography}>
                                {recordName}
                              </Typography>
                            </Paper>
                          </Tooltip>
                        </div>
                        <div className={classes.recordRow}>
                          <Typography>
                            Text:
                          </Typography>
                          <Tooltip title="copy text">
                            <Paper onClick={handleClickRecordText} className={classes.recordValue}>
                              <Typography className={classes.typography}>
                                {recordText ? recordText.slice(0, 7) + String.fromCharCode(8230) + recordText.slice(-7) : ''}
                              </Typography>
                            </Paper>
                          </Tooltip>
                        </div>
                        <div className={classNames(classes.recordRow, classes.recordRowLast)}>
                          <div className={classes.recordRowItem}>
                            <Typography>
                              Type:
                            </Typography>
                            <Tooltip title="copy text">
                              <Paper onClick={handleClickRecordType} className={classNames(classes.shortRecordValue, classes.recordValue)}>
                                <Typography className={classes.typography}>
                                  {recordType}
                                </Typography>
                              </Paper>
                            </Tooltip>
                          </div>
                          <div className={classes.recordRowItem}>
                            <Typography>
                              TTL:
                            </Typography>
                            <Tooltip title="copy text">
                              <Paper onClick={handleClickRecordTtl} className={classNames(classes.shortRecordValue, classes.recordValue)}>
                                <Typography className={classes.typography}>
                                  {recordTtl}
                                </Typography>
                              </Paper>
                            </Tooltip>
                          </div>
                        </div>
                      </React.Fragment>
                    )}
                  </div>
                  <div className={classes.actionsContainer}>
                    <div>
                      <Button
                        disabled={stepIndex === 0}
                        onClick={handleBack}
                        className={classes.button}
                      >
                        Back
                      </Button>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={errorIndex === stepIndex ? handleReset : () => handleNext(stepIndex)}
                        className={classes.button}
                        disabled={loading}
                      >
                        {
                          errorIndex === stepIndex
                            ? 'Reset'
                            : numCompletedSteps === stepIndex
                              ? getButtonLabel(stepIndex)
                              : 'Next'
                        }
                        {loading && <CircularProgress size={24} className={classes.buttonProgress}/>}
                      </Button>
                    </div>
                  </div>
                </div>
              </StepContent>
            </Step>
          ))}
        </Stepper>
        {activeStep === 3 && (
          <Paper square elevation={0} className={classes.resetContainer}>
            <Typography>
              {`Congratulations! Your account is now registered as the owner of ${domainName}`}
            </Typography>
            <Button onClick={handleClose} className={classes.button}>
              Close
            </Button>
          </Paper>
        )}
      </div>
      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        ContentProps={{
          'aria-describedby': 'message-id',
        }}
        message={<span id="message-id">Copied to clipboard</span>}
        action={[
          <IconButton
            key="close"
            aria-label="Close"
            color="inherit"
            className={classes.close}
            onClick={handleCloseSnackbar}
          >
            <CloseIcon />
          </IconButton>,
        ]}
        TransitionComponent={Slide}
      />
    </FullScreenDialog>
  );
}
