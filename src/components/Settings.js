import React from 'react'
import FullScreenDialog from './FullScreenDialog'
import { makeStyles } from '@material-ui/styles'
import IconButton from '@material-ui/core/IconButton'
import SettingsIcon from '@material-ui/icons/SettingsApplications'
import Tooltip from '@material-ui/core/Tooltip'
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Switch from '@material-ui/core/Switch';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

const useStyles = makeStyles(theme => ({
  contentRoot: {
    marginTop: theme.spacing(2),
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2)
  }
}));

function Settings({ settingsOptions, currentSettings, onChangeSetting }) {
  const classes = useStyles()
  const [open, setOpen] = React.useState(false);
  return (
    <div>
      <IconButton
        onClick={e => setOpen(true)}
        color="inherit"
        aria-label="Settings"
      >
        <Tooltip title="settings" enterDelay={300}>
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
            {Object.entries(currentSettings).map((setting, index) => (
              <ListItem key={index} style={{paddingLeft: 0}}>
                <ListItemText primary={setting[0].concat(':')} />
                <ListItemSecondaryAction>
                  {(typeof setting[1] === 'boolean') && <Switch
                    checked={setting[1]}
                    onChange={event => onChangeSetting(setting[0], event.target.checked)}
                  />}
                  {(typeof setting[1] === 'string') && <Select
                    value={setting[1]}
                    onChange={event => onChangeSetting(setting[0], event.target.value)}
                  >
                    {settingsOptions[setting[0]].map((key, index) => (
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

export default Settings
