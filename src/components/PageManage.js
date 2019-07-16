import React from 'react'
import Subscriptions from '../containers/Subscriptions'
import Page from './Page'
import Balances from '../containers/Balances'

const PageManage = ({ subscription, onChangeIndex }) => (
  <Page>
    <Subscriptions onChangeIndex={onChangeIndex}/>
    <Balances />
  </Page>
)

export default PageManage
