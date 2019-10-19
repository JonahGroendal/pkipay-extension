import React from 'react'
// import { makeStyles } from '@material-ui/styles'
import Page from './Page'
import ProfileCard from '../containers/ProfileCard'
import Token from '../containers/Token'
import Donate from '../containers/Donate'
import ClaimWebsiteCard from './ClaimWebsiteCard'

const WINDOW_HEIGHT = 600
const NAV_HEIGHT = 96

// const useStyles = makeStyles(theme => ({
//
// }));

function PageProfile({ hostname, domainName, domainOwner, address }) {
  // const classes = useStyles();

  const showAdminViewOption = (domainOwner === address)
  let [adminViewEnabled, setAdminViewEnabled] = React.useState(true)
  adminViewEnabled = adminViewEnabled && showAdminViewOption

  const [profileCardHeight, setProfileCardHeight] = React.useState(200)
  const ref = React.useRef(null)
  React.useEffect(() => setProfileCardHeight(ref.current.clientHeight))

  return (
    <div>
      <div ref={ref}>
        <ProfileCard
          hostname={hostname}
          showAdminViewOption={showAdminViewOption}
          adminViewEnabled={adminViewEnabled}
          onChangeAdminViewEnabled={() => setAdminViewEnabled(prev => !prev)}
          square={true}
        />
      </div>
      <Page height={WINDOW_HEIGHT - NAV_HEIGHT - profileCardHeight}>
        {!adminViewEnabled && (
          <Donate domainName={domainName} />
        )}
        {!!domainName && isZero(domainOwner) && (
          <ClaimWebsiteCard />
        )}
        <Token domainName={domainName} adminViewEnabled={adminViewEnabled}/>
      </Page>
    </div>
  )
}

function isZero(address) {
  return (address === '0x0000000000000000000000000000000000000000')
}

export default PageProfile
