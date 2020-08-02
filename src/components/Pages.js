import React from 'react'
import Nav from './Nav'
import PageProfile from '../containers/PageProfile'
import PageManage from '../containers/PageManage'
import SwipeableViews from 'react-swipeable-views'
import BottomNavigation from '@material-ui/core/BottomNavigation';
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction';
import AccountBalanceWalletIcon from '@material-ui/icons/AccountBalanceWallet';
import PersonIcon from '@material-ui/icons/Person';

function Pages({ tabIndex, onChangeTab, priceOfETHInUSD }) {
  return (
    <div>
      <Nav tabIndex={tabIndex} onChangeTab={onChangeTab} />
      <SwipeableViews index={tabIndex} onChangeIndex={onChangeTab}>
        <PageProfile
          priceOfETHInUSD={priceOfETHInUSD}
          onChangeTab={onChangeTab}
        />
        <PageManage
          priceOfETHInUSD={priceOfETHInUSD}
          onChangeTab={onChangeTab}
          inView={tabIndex === 1}
        />
      </SwipeableViews>
      <BottomNavigation value={tabIndex} onChange={(event, newValue) => onChangeTab(newValue)}>
        <BottomNavigationAction label="Target Account" value={0} icon={<PersonIcon />} />
        <BottomNavigationAction label="Wallet" value={1} icon={<AccountBalanceWalletIcon />} />
      </BottomNavigation>
    </div>
  )
}

export default Pages
