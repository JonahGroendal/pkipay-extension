import React from 'react'
import Balance from '../containers/Balance'
import Subscriptions from '../containers/Subscriptions'
import Page from './Page'
import Hodlings from '../containers/Hodlings'

const PageManage = ({ subscription, onChangeIndex }) => (
  <Page>
    <Subscriptions onChangeIndex={onChangeIndex}/>
    <Balance />
    <Hodlings />
  </Page>
)

export default PageManage
