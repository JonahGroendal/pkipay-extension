import React from 'react'
import Nav from './Nav'
import PageProfileContainer from '../containers/PageProfileContainer'
import PageManage from './PageManage'
import Tab from '@material-ui/core/Tab'
import SwipeableViews from 'react-swipeable-views'

const Pages = ({ tabIndex, onChangeTab }) => (
  <div>
    <Nav tabIndex={tabIndex} onChangeTab={onChangeTab}>
      <Tab label="Profile" />
      <Tab label="Manage" />
    </Nav>
    <SwipeableViews index={tabIndex} onChangeIndex={onChangeTab}>
      <PageProfileContainer />
      <PageManage onChangeIndex={onChangeTab} />
    </SwipeableViews>
  </div>
)

export default Pages
