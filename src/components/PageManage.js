import React from 'react'
import { makeStyles } from '@material-ui/styles'
import appConfig from '../api/appConfig'
// old - not going into 1.0: import Subscriptions from '../containers/Subscriptions'
import DonationSubscriptions from '../containers/DonationSubscriptions'
import Page from './Page'
import Balances from '../containers/Balances'
import PendingDonations from '../containers/PendingDonations'
import Transfer from '../containers/Transfer'
import AccountCard from '../containers/AccountCard'
import QRCodeScreen from '../containers/QRCodeScreen'

const NAV_HEIGHT = 104

const useStyles = makeStyles(theme => ({
  accountCardContainerRel: {
    position: 'relative',
    width: 0,
    height: 0
  },
  accountCardContainerAbs: {
    position: 'absolute',
    // zIndex: -1,
    width: appConfig.width
  },
  card: {
    position: 'relative',
    zIndex: 1
  }
}));

const PageManage = ({ subscription, onChangeIndex }) => {
  const classes = useStyles();

  const [qrCodeScreenOpen, setQrCodeScreenOpen] = React.useState(false)

  const handleOpenQrCodeScreen = () => setQrCodeScreenOpen(true)
  const handleCloseQrCodeScreen = () => setQrCodeScreenOpen(false)

  const transferInputElem = React.useRef(null)
  const transferContainerElem = React.useRef(null)
  const handleClickSend = () => {
    if (transferContainerElem.current) {
      transferContainerElem.current.scrollIntoView({ behavior: 'smooth' })
    }
    if (transferInputElem.current) {
      // 400ms is enough for firefox but chrome needs 600ms
      setTimeout(() => transferInputElem.current.focus(), 600)
    }
  }

  // Get height of elements after they render. Values will be set after
  // the first render but before the browser paints for the first time.
  const [accountCardRenderHeight, setAccountCardRenderHeight] = React.useState(0)
  const accountCardRef = React.useRef(null)
  React.useLayoutEffect(() => {
    if (accountCardRef.current)
      setAccountCardRenderHeight(accountCardRef.current.clientHeight)
  })

  return (
    <div>
      <QRCodeScreen open={qrCodeScreenOpen} onClose={handleCloseQrCodeScreen} />

      {/* hack to relatively position a div without affecting the page flow */}
      <div className={classes.accountCardContainerRel}>
        <div ref={accountCardRef} className={classes.accountCardContainerAbs}>
          <AccountCard
            onClickSend={handleClickSend}
            onClickAccount={handleOpenQrCodeScreen}
          />
        </div>
      </div>
      <Page height={appConfig.height - NAV_HEIGHT}>
        <div style={{ height: accountCardRenderHeight }}></div>
        {/* old - not going into 1.0: <Subscriptions onChangeIndex={onChangeIndex}/>*/}
        <div className={classes.card}>
          <DonationSubscriptions onChangeIndex={onChangeIndex} />
        </div>
        <div className={classes.card}>
          <Balances onChangeIndex={onChangeIndex} onClickAddFunds={handleOpenQrCodeScreen} />
        </div>
        <div className={classes.card} ref={transferContainerElem}>
          <Transfer firstInputRef={transferInputElem} />
        </div>
        <div className={classes.card}>
          <PendingDonations />
        </div>
      </Page>
    </div>
  )
}
export default PageManage
