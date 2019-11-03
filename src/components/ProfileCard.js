import React from 'react'
// import SubscribeForm from '../containers/SubscribeForm'
import { makeStyles } from '@material-ui/styles'
// import Paper from '@material-ui/core/Paper'
import Avatar from '@material-ui/core/Avatar'
import Typography from '@material-ui/core/Typography'
import Tooltip from '@material-ui/core/Tooltip'
// import getPixels from 'get-pixels'

const useStyles = makeStyles(theme => ({
  paper: {
    padding: theme.spacing(2),
    paddingTop: 0,
    display: 'flex',
    flexDirection: 'column',
  },
  paperAvatar: {
    width: '57px',
    borderRadius: '57px',
    // marginTop: theme.spacing(-3),
  },
  rowAvatar: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  columnAvatar: {
    paddingRight: theme.spacing(2),
    display: 'flex',
    alignItems: 'center'
  },
  columnInfo: {
    flexGrow: 1
  },
  avatar: {
    width: theme.spacing(8),
    height: theme.spacing(8),
    justifyContent: 'center'
  },
  buttonSubscribe: {
    alignSelf: 'flex-end'
  },
  subscribeContainer: {
    marginTop: theme.spacing(2),
  },
  subscribePaper: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    transitionProperty: 'width',
    transitionDuration: '300ms',
    transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  subscribeForm: {
    // transition: 'width 225ms cubic-bezier(0.4, 0, 0.2, 1) 0ms'
    // transitionProperty: 'width',
  },
  form: {
    //backgroundColor: theme.palette.grey['A100']
  }
}));

function ProfileCard(props) {
  const classes = useStyles()

  return (
    <div>
      <div className={classes.paper}>
        <div className={classes.rowAvatar}>
          <div className={classes.paperAvatar}>
            {props.largeFaviconExists ? <Avatar
              src={props.faviconUrl}
              className={classes.avatar}
              imgProps={{
                height: "57",
                width: "57",
                onError: () => props.setLargeFaviconExists(false)
              }}
            >
            </Avatar> :
            <Avatar style={{ height: 57, width: 57 }}>
              { props.avatarLetter }
            </Avatar>
            /*<svg height="57" width="57">
              <style>
                .heavy { font: 50px roboto; }
              </style>
              <circle cx="28" cy="28" r="28" fill="red" />
              <text text-anchor="middle" x="28" y="46" fill="white" class="heavy">
                { avatarLetter }
              </text>
            </svg>*/}
          </div>
          <Tooltip title={props.hostname} enterDelay={300}>
            <Typography variant="h4" align="center">
              { props.displayName || String.fromCharCode('&nbsp') }
            </Typography>
          </Tooltip>
          <div>
            <Typography variant="body2" align="center">
              {props.currencySymbol + props.totalDonations.toFixed(2) + ' in total contributions'}
            </Typography>
            <Typography variant="body2" align="center">
              {props.currencySymbol + props.totalDonationsOneMonth.toFixed(2) + ' last month'}
            </Typography>
          </div>
        </div>
        {/*!props.adminViewEnabled && <div className={classes.subscribeContainer}>
          <SubscribeForm domainName={props.domainName} />
        </div>*/}
      </div>
    </div>
  )
}

export default ProfileCard
