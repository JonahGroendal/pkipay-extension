import React from 'react'
import Page from './Page'
import ProfileCard from '../containers/ProfileCard'
import Donate from '../containers/Donate'
import ClaimWebsiteCard from './ClaimWebsiteCard'
import WithdrawDonationsCard from '../containers/WithdrawDonationsCard'

const PageProfile = ({ hostname, domainName, domainOwner, address }) => (
  <Page>
    <ProfileCard hostname={hostname} />
    <Donate domainName={domainName} />
    {!!domainName && isZero(domainOwner) && <ClaimWebsiteCard />}
    {domainOwner === address && <WithdrawDonationsCard domainName={domainName} />}
  </Page>
)

function isZero(address) {
  return (address === '0x0000000000000000000000000000000000000000')
}

export default PageProfile
