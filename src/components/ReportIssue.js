import React from 'react'
import IconButton from '@material-ui/core/IconButton'
import BugReportIcon from '@material-ui/icons/BugReport'
import Tooltip from '@material-ui/core/Tooltip'
import { navigateTo } from '../api/browser'

function ReportIssue() {
  const handleClick = async () => {
    try {
      await navigateTo('https://github.com/JonahGroendal/pkipay-extension/issues/new')
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div>
      <IconButton
        onClick={handleClick}
        color="inherit"
        aria-label="Settings"
      >
        <Tooltip title="report an issue" enterDelay={300}>
          <BugReportIcon />
        </Tooltip>
      </IconButton>
    </div>
  )
}

export default ReportIssue
