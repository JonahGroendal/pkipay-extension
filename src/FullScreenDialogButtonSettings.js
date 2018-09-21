import React, { Component } from 'react'
import FullScreenDialog from './FullScreenDialog'
import BrowserStorageContext from './BrowserStorageContext'
import strings from './api/strings'
import IconButton from '@material-ui/core/IconButton'
import SettingsIcon from '@material-ui/icons/SettingsApplications'
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

class FullScreenDialogButtonSettings extends Component {
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
    const { open } = this.state
    return (
      <div>
        <IconButton
          onClick={this.handleClickOpen}
          color="inherit"
          aria-label="Settings"
        >
          <SettingsIcon />
        </IconButton>
        <FullScreenDialog
          title="Settings"
          open={open}
          onClose={this.handleClose}
        >
          <BrowserStorageContext.Consumer>
            {storage => {
              if (!storage.state) return '';
              const { settings } = storage.state;
              return (
                <List>
                  {Object.entries(settings).map((setting, index) => (
                    <ListItem key={index}>
                      <ListItemText primary={setting[0]} />
                      <ListItemSecondaryAction>
                        {(typeof setting[1] === 'boolean') && <Switch
                          checked={setting[1]}
                          onChange={event => storage.handleChange('settings.' + setting[0], event.target.checked)}
                        />}
                        {(typeof setting[1] === 'string') && <Select
                          value={setting[1]}
                          onChange={event => storage.handleChange('settings.' + setting[0], event.target.value)}
                        >
                          {Object.keys(strings[setting[0]]).map((key, index) => (
                            <MenuItem key={index} value={key}>{key}</MenuItem>
                          ))}
                        </Select>}
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )
            }}
          </BrowserStorageContext.Consumer>
        </FullScreenDialog>
      </div>
    )
  }
}

export default FullScreenDialogButtonSettings
