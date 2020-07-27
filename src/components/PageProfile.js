import React from 'react'
import { makeStyles } from '@material-ui/styles'
import appConfig from '../api/appConfig'
import Page from './Page'
import ProfileCard from '../containers/ProfileCard'
import DnsChallengeScreen from '../containers/DnsChallengeScreen'
import Donate from '../containers/Donate'
import ClaimWebsiteCard from './ClaimWebsiteCard'
import Typography from '@material-ui/core/Typography'
import Switch from '@material-ui/core/Switch'
import { isEnsNode } from '../api/utils'

// old - not in 1.0
//import Token from '../containers/Token'

const NAV_HEIGHT = 104

const useStyles = makeStyles(theme => ({
  profileCardContainerRel: {
    position: 'relative',
    width: 0,
    height: 0
  },
  profileCardContainerAbs: {
    position: 'absolute',
    zIndex: -1,
    width: appConfig.width
  },
  adminViewSwitch: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center'
  }
}));

function PageProfile(props) {
  const {
    hostname,
    ensAddress,
    resolvedAddress,
    address,
    pendingWithdrawals,
    setPendingWithdrawals,
    pendingWithdrawalsExist
  } = props
  const classes = useStyles();

  // old - not going into 1.0:
  // const showAdminViewOption = (resolvedAddress === address)
  // let [adminViewEnabled, setAdminViewEnabled] = React.useState(true)
  // adminViewEnabled = adminViewEnabled && showAdminViewOption

  const [dnsChalScreenOpen, setDnsChalScreenOpen] = React.useState(false)

  // Get height of elements after they render. Values will be set after
  // the first render but before the browser paints for the first time.
  const [profileCardRenderHeight, setProfileCardRenderHeight] = React.useState(0)
  const [adminViewRenderHeight, setAdminViewRenderHeight] = React.useState(0)
  const profileCardRef = React.useRef(null)
  const adminViewRef = React.useRef(null)
  React.useLayoutEffect(() => {
    if (profileCardRef.current)
      setProfileCardRenderHeight(profileCardRef.current.clientHeight)
    if (adminViewRef.current)
      setAdminViewRenderHeight(adminViewRef.current.clientHeight)
  })

  return (
    <div>
      {/* old - not going into 1.0: showAdminViewOption && (
        <div className={classes.adminViewSwitch} ref={adminViewRef}>
          <Typography>
            Administrative view
          </Typography>
          <Switch
            checked={adminViewEnabled}
            onChange={() => setAdminViewEnabled(prev => !prev)}
          />
        </div>
      )*/}
      <div>
        {/* hack to relatively position a div without affecting the page flow */}
        <div className={classes.profileCardContainerRel}>
          <div ref={profileCardRef} className={classes.profileCardContainerAbs}>
            <ProfileCard
              ensAddress={ensAddress}
              hostname={hostname}
              square={true}
              targetRegistered={resolvedAddress !== '0x0000000000000000000000000000000000000000'}
            />
          </div>
        </div>
        <Page height={appConfig.height - NAV_HEIGHT - adminViewRenderHeight}>
          <div style={{ height: profileCardRenderHeight }}></div>
          {resolvedAddress === address && (
            <Typography variant="h6" align="center">
              You own this site
            </Typography>
          )}
          {resolvedAddress !== address && (
            <Donate ensAddress={ensAddress} />
          )}
          <div>
            {!!ensAddress && !isEnsNode(ensAddress) && resolvedAddress !== address && (
              <ClaimWebsiteCard
                alreadyClaimed={!isZero(resolvedAddress)}
                onClickButton={() => setDnsChalScreenOpen(true)}
              />
            )}
            <DnsChallengeScreen
              open={dnsChalScreenOpen}
              onClose={() => setDnsChalScreenOpen(false)}
              onOpen={() => setDnsChalScreenOpen(true)}
              pendingWithdrawals={pendingWithdrawals}
              setPendingWithdrawals={setPendingWithdrawals}
            />
          </div>
          {/*pendingWithdrawalsExist && (
            TODO: card for withdrawing in case there are pending withdrawals even tho this ENS address resolves to an eth address (not sure how but maybe it could happen)
          )*/}
          {/*old - not going into 1.0: <Token ensAddress={ensAddress} adminViewEnabled={adminViewEnabled}/>*/}
        </Page>
      </div>
    </div>
  )
}

function isZero(address) {
  return (address === '0x0000000000000000000000000000000000000000')
}

export default PageProfile
