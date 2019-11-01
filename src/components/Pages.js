import React from 'react'
import Nav from './Nav'
import PageProfile from '../containers/PageProfile'
import PageManage from './PageManage'
import Tab from '@material-ui/core/Tab'
import SwipeableViews from 'react-swipeable-views'
import BottomNavigation from '@material-ui/core/BottomNavigation';
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction';
import AccountBalanceWalletIcon from '@material-ui/icons/AccountBalanceWallet';
import PersonIcon from '@material-ui/icons/Person';

function Pages({ tabIndex, onChangeTab }) {
  return (
    <div>
      <Nav tabIndex={tabIndex} onChangeTab={onChangeTab} />
      <SwipeableViews index={tabIndex} onChangeIndex={onChangeTab}>
        <PageProfile />
        <PageManage onChangeIndex={onChangeTab} />
      </SwipeableViews>
      <BottomNavigation value={tabIndex} onChange={(event, newValue) => onChangeTab(newValue)}>
        <BottomNavigationAction label="Target Account" value={0} icon={<PersonIcon />} />
        <BottomNavigationAction label="Wallet" value={1} icon={<AccountBalanceWalletIcon />} />
      </BottomNavigation>
    </div>
  )
}

export default Pages
