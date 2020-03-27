import React from 'react'
import { makeStyles } from '@material-ui/styles'
import appConfig from '../api/appConfig'
import Page from './Page'
import ProfileCard from '../containers/ProfileCard'
import DnsChallengeScreen from '../containers/DnsChallengeScreen'
import Token from '../containers/Token'
import Donate from '../containers/Donate'
import ClaimWebsiteCard from './ClaimWebsiteCard'
import Typography from '@material-ui/core/Typography'
import Switch from '@material-ui/core/Switch'
import { isEnsNode } from '../api/utils'

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
    ensAddressOwner,
    address,
    pendingWithdrawals,
    setPendingWithdrawals,
    pendingWithdrawalsExist
  } = props
  const classes = useStyles();

  const showAdminViewOption = (ensAddressOwner === address)
  let [adminViewEnabled, setAdminViewEnabled] = React.useState(true)
  adminViewEnabled = adminViewEnabled && showAdminViewOption

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
      {showAdminViewOption && (
        <div className={classes.adminViewSwitch} ref={adminViewRef}>
          <Typography>
            Administrative view
          </Typography>
          <Switch
            checked={adminViewEnabled}
            onChange={() => setAdminViewEnabled(prev => !prev)}
          />
        </div>
      )}
      <div>
        {/* hack to relatively position a div without affecting the page flow */}
        <div className={classes.profileCardContainerRel}>
          <div ref={profileCardRef} className={classes.profileCardContainerAbs}>
            <ProfileCard
              ensAddress={ensAddress}
              hostname={hostname}
              square={true}
            />
          </div>
        </div>
        <Page height={appConfig.height - NAV_HEIGHT - adminViewRenderHeight}>
          <div style={{ height: profileCardRenderHeight }}></div>
          {!adminViewEnabled && (
            <Donate ensAddress={ensAddress} />
          )}
          <div>
            {!!ensAddress && !isEnsNode(ensAddress) && (isZero(ensAddressOwner) || pendingWithdrawalsExist) && (
              <ClaimWebsiteCard
                onClickButton={() => setDnsChalScreenOpen(true)}
              />
            )}
            <DnsChallengeScreen
              open={dnsChalScreenOpen}
              onClose={() => setDnsChalScreenOpen(false)}
              onOpen={() => setDnsChalScreenOpen(true)}
              ensAddressOwner={ensAddressOwner}
              pendingWithdrawals={pendingWithdrawals}
              setPendingWithdrawals={setPendingWithdrawals}
            />
          </div>
          <Token ensAddress={ensAddress} adminViewEnabled={adminViewEnabled}/>
        </Page>
      </div>
    </div>
  )
}

function isZero(address) {
  return (address === '0x0000000000000000000000000000000000000000')
}

export default PageProfile
