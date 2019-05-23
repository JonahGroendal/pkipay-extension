import React from 'react'
import Balance from '../containers/Balance'
import Subscriptions from '../containers/Subscriptions'
import Page from './Page'
import Hodlings from '../containers/Hodlings'

const PageManage = ({ subscription, onChangeIndex }) => (
  <Page>
    <Balance />
    <Subscriptions onChangeIndex={onChangeIndex}/>
    <Hodlings />
  </Page>
)

export default PageManage
