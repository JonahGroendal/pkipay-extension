import React from 'react'
import Nav from './Nav'
import PageProfileContainer from '../containers/PageProfileContainer'
import PageManage from './PageManage'
import Tab from '@material-ui/core/Tab'
import SwipeableViews from 'react-swipeable-views'

function Pages(props) {
  const [index, setIndex] = React.useState(0)

  return (
    <div>
      <Nav tabIndex={index} onChangeTab={setIndex}>
        <Tab label="Profile" />
        <Tab label="Manage" />
      </Nav>
      <SwipeableViews index={index} onChangeIndex={setIndex}>
        <PageProfileContainer />
        <PageManage onChangeIndex={setIndex} />
      </SwipeableViews>
    </div>
  )
}

export default Pages
