import React, { Component } from 'react'
import FullScreenDialog from './FullScreenDialog'
import strings from '../api/strings'
import { withStyles } from '@material-ui/core/styles'
import IconButton from '@material-ui/core/IconButton'
import SettingsIcon from '@material-ui/icons/SettingsApplications'
import Tooltip from '@material-ui/core/Tooltip'
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Switch from '@material-ui/core/Switch';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import WifiIcon from '@material-ui/icons/Wifi';
import ListSubheader from '@material-ui/core/ListSubheader';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import { connect } from 'react-redux';
import { setCurrency, setPaymentSchedule, setThemeType } from '../actions'

function Settings(props) {
  const {
    settings,
    onChangeCurrency,
    onChangePaymentSchedule,
    onChangeThemeType,
    classes
  } = props;

  const [open, setOpen] = React.useState(false);

  const changeSetting = {
    "currency": onChangeCurrency,
    "paymentSchedule": onChangePaymentSchedule,
    "themeType": onChangeThemeType,
  }
  return (
    <div>
      <IconButton
        onClick={e => setOpen(true)}
        color="inherit"
        aria-label="Settings"
      >
        <Tooltip title="settings">
          <SettingsIcon />
        </Tooltip>
      </IconButton>
      <FullScreenDialog
        title="Settings"
        open={open}
        onClose={e => setOpen(false)}
      >
        <div className={classes.contentRoot}>
          <List style={{ paddingTop: 0 }}>
            {Object.entries(settings).map((setting, index) => (
              <ListItem key={index} style={{paddingLeft: 0}}>
                <ListItemText primary={setting[0]} />
                <ListItemSecondaryAction>
                  {(typeof setting[1] === 'boolean') && <Switch
                    checked={setting[1]}
                    onChange={event => changeSetting[setting[0]](event.target.checked)}
                  />}
                  {(typeof setting[1] === 'string') && <Select
                    value={setting[1]}
                    onChange={event => changeSetting[setting[0]](event.target.value)}
                  >
                    {Object.keys(strings[setting[0]]).map((key, index) => (
                      <MenuItem key={index} value={key}>{key}</MenuItem>
                    ))}
                  </Select>}
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </div>
      </FullScreenDialog>
    </div>
  )
}

const styles = theme => ({
  contentRoot: {
    marginTop: theme.spacing.unit * 2,
    marginLeft: theme.spacing.unit * 2,
    marginRight: theme.spacing.unit * 2
  }
})
Settings = withStyles(styles)(Settings)

const mapStateToProps = state => ({
  settings: state.settings
})
const mapDispatchToProps = dispatch => ({
  onChangeCurrency: c => dispatch(setCurrency(c)),
  onChangePaymentSchedule: s => dispatch(setPaymentSchedule(s)),
  onChangeThemeType: t => dispatch(setThemeType(t)),
})
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Settings)
