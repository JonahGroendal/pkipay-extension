import React from 'react'
import Page from './Page'
import Profile from './Profile'
import Donate from '../containers/Donate'
import ClaimWebsiteCard from './ClaimWebsiteCard'

const PageProfile = ({ subscription, domainOwner }) => (
  <Page>
    <Profile subscription={subscription} />
    <Donate subscription={subscription} />
    {isZeroOrNull(domainOwner) && <ClaimWebsiteCard />}
  </Page>
)

function isZeroOrNull(address) {
  return (address === '0x0000000000000000000000000000000000000000' || address === null)
}

export default PageProfile
