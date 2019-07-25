import React from 'react'
import Page from './Page'
import Profile from './Profile'
import Donate from '../containers/Donate'
import ClaimWebsiteCard from './ClaimWebsiteCard'
import WithdrawDonationsCard from '../containers/WithdrawDonationsCard'

const PageProfile = ({ subscription, domainOwner, address }) => (
  <Page>
    <Profile subscription={subscription} />
    <Donate subscription={subscription} />
    {!!subscription.hostname && isZero(domainOwner) && <ClaimWebsiteCard />}
    {domainOwner === address && <WithdrawDonationsCard subscription={subscription} />}
  </Page>
)

function isZero(address) {
  return (address === '0x0000000000000000000000000000000000000000')
}

export default PageProfile
