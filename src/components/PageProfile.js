import React from 'react'
import Page from './Page'
import Profile from './Profile'
import Donate from '../containers/Donate'
import ClaimWebsiteCard from './ClaimWebsiteCard'

const PageProfile = ({ subscription, domainOwner }) => (
  <Page>
    <Profile subscription={subscription} />
    <Donate subscription={subscription} />
    {isZero(domainOwner) && <ClaimWebsiteCard />}
  </Page>
)

function isZero(address) {
  return (address === '0x0000000000000000000000000000000000000000')
}

export default PageProfile
