import React from 'react'
import BalanceContainer from '../containers/BalanceContainer'
import SubscriptionsContainer from '../containers/SubscriptionsContainer'
import Page from './Page'
import HodlingsContainer from '../containers/HodlingsContainer'

const PageManage = ({ subscription, onChangeIndex }) => (
  <Page>
    <BalanceContainer />
    <SubscriptionsContainer onChangeIndex={onChangeIndex}/>
    <HodlingsContainer />
  </Page>
)

export default PageManage
