import React from 'react'
import Nav from './Nav'
import PageProfile from '../containers/PageProfile'
import PageManage from './PageManage'
import Tab from '@material-ui/core/Tab'
import SwipeableViews from 'react-swipeable-views'

const Pages = ({ tabIndex, onChangeTab }) => (
  <div>
    <Nav tabIndex={tabIndex} onChangeTab={onChangeTab}>
      <Tab label="Profile" />
      <Tab label="My wallet" />
    </Nav>
    <SwipeableViews index={tabIndex} onChangeIndex={onChangeTab}>
      <PageProfile />
      <PageManage onChangeIndex={onChangeTab} />
    </SwipeableViews>
  </div>
)

export default Pages
