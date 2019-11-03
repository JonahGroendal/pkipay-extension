import React from 'react'
import { makeStyles } from '@material-ui/styles'
import appConfig from '../api/appConfig'
import Page from './Page'
import ProfileCard from '../containers/ProfileCard'
import Token from '../containers/Token'
import Donate from '../containers/Donate'
import ClaimWebsiteCard from './ClaimWebsiteCard'
import Typography from '@material-ui/core/Typography'
import Switch from '@material-ui/core/Switch'

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

function PageProfile({ hostname, domainName, domainOwner, address }) {
  const classes = useStyles();

  const showAdminViewOption = (domainOwner === address)
  let [adminViewEnabled, setAdminViewEnabled] = React.useState(true)
  adminViewEnabled = adminViewEnabled && showAdminViewOption

  const [profileCardHeight, setProfileCardHeight] = React.useState(104)
  const ref = React.useRef(null)
  React.useEffect(() => setProfileCardHeight(ref.current.clientHeight))

  return (
    <div>
      {showAdminViewOption && (
        <div className={classes.adminViewSwitch}>
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
          <div ref={ref} className={classes.profileCardContainerAbs}>
            <ProfileCard
              hostname={hostname}
              square={true}
            />
          </div>
        </div>
        <Page height={appConfig.height - NAV_HEIGHT/* - profileCardHeight*/}>
          <div style={{ height: profileCardHeight }}></div>
          {!adminViewEnabled && (
            <Donate domainName={domainName} />
          )}
          {!!domainName && isZero(domainOwner) && (
            <ClaimWebsiteCard />
          )}
          <Token domainName={domainName} adminViewEnabled={adminViewEnabled}/>
        </Page>
      </div>
    </div>
  )
}

function isZero(address) {
  return (address === '0x0000000000000000000000000000000000000000')
}

export default PageProfile
