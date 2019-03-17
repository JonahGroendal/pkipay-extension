import React from 'react'
import Page from './Page'
import Profile from './Profile'
import Donate from '../containers/Donate'
import MostViewedSites from './MostViewedSites'

const PageProfile = ({ subscription }) => (
  <Page>
    <Profile subscription={subscription} />
    <Donate subscription={subscription} />
  </Page>
)

export default PageProfile
