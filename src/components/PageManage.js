import React from 'react'
import Subscriptions from '../containers/Subscriptions'
import Page from './Page'
import Balances from '../containers/Balances'

const WINDOW_HEIGHT = 600
const NAV_HEIGHT = 96

const PageManage = ({ subscription, onChangeIndex }) => (
  <Page height={WINDOW_HEIGHT - NAV_HEIGHT}>
    <Subscriptions onChangeIndex={onChangeIndex}/>
    <Balances />
  </Page>
)

export default PageManage
