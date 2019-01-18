import React from 'react'
import Page from './Page'
import Profile from './Profile'
import Donate from '../containers/Donate'
import MostViewedSites from './MostViewedSites'

const PageProfile = ({ subscription, showMostViewedSites }) => (
  <Page>
    <Profile subscription={subscription}/>
    <Donate subscription={subscription} />
    {showMostViewedSites && <MostViewedSites />}
  </Page>
)

export default PageProfile
