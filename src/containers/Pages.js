import React from 'react'
import { connect } from 'react-redux'
import PresentationalComponent from '../components/Pages'
import { getPriceOfETHInUSD } from '../api/blockchain'

function Pages() {
  const [tabIndex, setTabIndex] = React.useState(0)
  const [priceOfETHInUSD, setPriceOfETHInUSD] = React.useState(0)

  React.useEffect(() => {
    getPriceOfETHInUSD().then(setPriceOfETHInUSD)
  }, [])

  const handleChangeTab = tabIndex => setTabIndex(tabIndex)

  return React.createElement(PresentationalComponent, {
    tabIndex,
    onChangeTab: handleChangeTab,
    priceOfETHInUSD
  })
}

export default Pages
