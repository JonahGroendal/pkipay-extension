import React from 'react'
import Page from './Page'
import ProfileCard from '../containers/ProfileCard'
import Token from '../containers/Token'
import Donate from '../containers/Donate'
import ClaimWebsiteCard from './ClaimWebsiteCard'

const PageProfile = ({ hostname, domainName, domainOwner, address }) => (
  <Page>
    <ProfileCard hostname={hostname} />
    {!!domainName && isZero(domainOwner) && <ClaimWebsiteCard />}
    <Token domainName={domainName} adminViewEnabled={domainOwner === address}/>
    <Donate domainName={domainName} />
  </Page>
)

function isZero(address) {
  return (address === '0x0000000000000000000000000000000000000000')
}

export default PageProfile
