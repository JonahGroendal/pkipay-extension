import React from 'react'
import PresentationalComponent from '../components/ProfileCard'
import { connect } from 'react-redux'
import { getTotalContributions, addresses } from '../api/blockchain'
import currencySymbols from '../api/currencySymbols'
import { convertFromUSD } from '../api/ECBForexRates'

function ProfileCard({ hostname, ensAddress, currency, txScreenOpen, square, targetRegistered, priceOfETHInUSD }) {
  const faviconUrl = 'https://' + hostname + '/apple-touch-icon.png'
  const [largeFaviconExists, setLargeFaviconExists] = React.useState(false)
  const [totalDonations, setTotalDonations] = React.useState(0)
  const [totalDonationsOneMonth, setTotalDonationsOneMonth] = React.useState(0)

  React.useEffect(() => {
    if (ensAddress && priceOfETHInUSD) {
      if (!txScreenOpen) {
        getTotalContributions(ensAddress)
        .then(contribs => {
          let usdValue = 0
          if (contribs.all[addresses.DAI]) usdValue += contribs.all[addresses.DAI]
          if (contribs.all[addresses.ETH]) usdValue += contribs.all[addresses.ETH] * priceOfETHInUSD
          setTotalDonations(convertFromUSD(currency, usdValue))
          usdValue = 0
          if (contribs.lastMonth[addresses.DAI]) usdValue += contribs.lastMonth[addresses.DAI]
          if (contribs.lastMonth[addresses.ETH]) usdValue += contribs.lastMonth[addresses.ETH] * priceOfETHInUSD
          setTotalDonationsOneMonth(convertFromUSD(currency, usdValue))
        })
        let xhr = new XMLHttpRequest()
        xhr.open("GET", faviconUrl, true)
        xhr.onloadend = () => {
          if (xhr.status !== 404 && xhr.status !== 0)
            setLargeFaviconExists(true)
          else
            setLargeFaviconExists(false)
        }
        xhr.send()
      }
    } else {
      setTotalDonations(0)
      setTotalDonationsOneMonth(0)
      setLargeFaviconExists(false)
    }
  }, [hostname, ensAddress, priceOfETHInUSD, currency, txScreenOpen])

  // const [avatarColor, setAvatarColor] = React.useState('')
  // React.useEffect(updateState, [subscription, currency])
  // function updateState() {
  //   const { hostname, name } = subscription
  //   if (hostname !== '') {
  //     setTotalDonations(0)
  //     setTotalDonationsOneMonth(0)
  //     Promise.all([
  //       getTotalDonations(hostname),
  //       getTotalDonationsFromOneMonth(hostname)
  //     ]).then(([totalDonations, totalDonationsOneMonth]) => {
  //       setTotalDonations(convertFromUSD(currency, totalDonations))
  //       setTotalDonationsOneMonth(convertFromUSD(currency, totalDonationsOneMonth))
  //     })
  //   }
  //   if (hostname.includes('#')){
  //     setDisplayName(name ? name : hostname)
  //     setLargeFaviconExists(false)
  //     setAvatarColor('#bdbdbd')
  //   } else {
  //     //console.log(hostname)
  //     const parts = hostname.split('.')
  //     let displayName
  //     if (hostname.includes("#") || parts.length < 2) {
  //       displayName = hostname
  //     } else {
  //       displayName = parts[parts.length-2]+'.'+parts[parts.length-1]
  //     }
  //     // Check if large favicon exists
  //     const faviconUrlLarge = 'https://' + hostname + '/apple-touch-icon.png'
  //     let xhr = new XMLHttpRequest()
  //     xhr.open("GET", faviconUrlLarge, true)
  //     xhr.onloadend = () => {
  //       let largeFaviconExists = (xhr.status !== 404 && xhr.status !== 0)
  //       console.log("xhr.status: ", xhr.status)
  //       if (largeFaviconExists) {
  //         // If so, set state
  //         setDisplayName(displayName)
  //         setLargeFaviconExists(true)
  //       } else {
  //         // Else get mode of small favicon colors array and set state
  //         const faviconUrlSmall = 'https://www.google.com/s2/favicons?domain=' + hostname
  //         getPixels(faviconUrlSmall, (err, pixels) => {
  //           if (err) {
  //             setDisplayName(displayName)
  //             setLargeFaviconExists(false)
  //             setAvatarColor('#bdbdbd')
  //           } else {
  //             let colors = []
  //             for (let i=0; i<pixels.data.length/4; i++) {
  //               colors.push(pixels.data[i*4].toString(16) + pixels.data[i*4+1].toString(16) + pixels.data[i*4+2].toString(16))
  //             }
  //             let avatarColor = '#' + mode(colors.filter(color => color !== "000"))
  //             if (avatarColor === '#ffffff') avatarColor = '#bdbdbd'
  //             setDisplayName(displayName)
  //             setLargeFaviconExists(false)
  //             setAvatarColor(avatarColor)
  //           }
  //         })
  //       }
  //     }
  //     xhr.send()
  //   }
  // }

  // const parts = hostname.split('.')
  // let siteUrl = ''
  // if (parts.length >= 2)
  //   siteUrl = hostname.includes("#") ? hostname : parts[parts.length-2]+'.'+parts[parts.length-1]
  // const truncate = (str, len) => Array.from(str.substring(0, len)).map((c, i) => i!==len-1 ? c : String.fromCharCode(8230)).join('')

  return React.createElement(PresentationalComponent, {
    hostname,
    square,
    largeFaviconExists,
    setLargeFaviconExists,
    totalDonations,
    totalDonationsOneMonth,
    faviconUrl,
    targetRegistered,
    displayName: ensAddress.replace('.dnsroot.eth', '').replace('.dnsroot.test', ''),
    tooltipName: ensAddress,
    currencySymbol: currencySymbols[currency]
  })
}

const mapStateToProps = state => ({
  currency: state.settings['Currency'],
  txScreenOpen: state.transactionScreen.isOpen
})

export default connect(mapStateToProps)(ProfileCard)

// function mode(array) {
//   if(array.length === 0)
//       return null;
//   var modeMap = {};
//   var maxEl = array[0], maxCount = 1;
//   for(var i = 0; i < array.length; i++)
//   {
//       var el = array[i];
//       if(modeMap[el] == null)
//           modeMap[el] = 1;
//       else
//           modeMap[el]++;
//       if(modeMap[el] > maxCount)
//       {
//           maxEl = el;
//           maxCount = modeMap[el];
//       }
//   }
//   return maxEl;
// }
