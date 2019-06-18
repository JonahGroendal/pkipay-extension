import React from 'react'
import FullScreenDialog from './FullScreenDialog'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'

const DnsChallengeScreen = ({ open, onClose, onSubmitChallenge, recordName, recordText }) => (
  <FullScreenDialog
    title={"Prove Site Ownership"}
    open={open}
    onClose={onClose}
  >
    <div>
      <Typography>
        {recordName}
      </Typography>
      <Typography>
        {recordText}
      </Typography>
      <Button onClick={onSubmitChallenge}>
        Submit dns challenge
      </Button>
    </div>
  </FullScreenDialog>
)

export default DnsChallengeScreen
