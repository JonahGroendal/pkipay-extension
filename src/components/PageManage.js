import React from 'react'
import appConfig from '../api/appConfig'
import Subscriptions from '../containers/Subscriptions'
import Page from './Page'
import Balances from '../containers/Balances'
import PendingDonations from '../containers/PendingDonations'

const NAV_HEIGHT = 104

const PageManage = ({ subscription, onChangeIndex }) => (
  <Page height={appConfig.height - NAV_HEIGHT}>
    <Subscriptions onChangeIndex={onChangeIndex}/>
    <Balances onChangeIndex={onChangeIndex}/>
    <PendingDonations />
  </Page>
)

export default PageManage
