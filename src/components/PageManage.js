import React from 'react'
import appConfig from '../api/appConfig'
// old - not going into 1.0: import Subscriptions from '../containers/Subscriptions'
import DonationSubscriptions from '../containers/DonationSubscriptions'
import Page from './Page'
import Balances from '../containers/Balances'
import PendingDonations from '../containers/PendingDonations'
import Transfer from '../containers/Transfer'

const NAV_HEIGHT = 104

const PageManage = ({ subscription, onChangeIndex }) => (
  <Page height={appConfig.height - NAV_HEIGHT}>
    {/* old - not going into 1.0: <Subscriptions onChangeIndex={onChangeIndex}/>*/}
    <DonationSubscriptions onChangeIndex={onChangeIndex}/>
    <Balances onChangeIndex={onChangeIndex}/>
    <Transfer />
    <PendingDonations />
  </Page>
)

export default PageManage
