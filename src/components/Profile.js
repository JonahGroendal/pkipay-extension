import React from 'react'
import { connect } from 'react-redux'
import SubscribeForm from '../containers/SubscribeForm'
import { getTotalDonations, getTotalDonationsFromOneMonth } from '../api/blockchain'
import { makeStyles } from '@material-ui/styles'
import Paper from '@material-ui/core/Paper'
import Avatar from '@material-ui/core/Avatar'
import Typography from '@material-ui/core/Typography'
import Tooltip from '@material-ui/core/Tooltip'
// import getPixels from 'get-pixels'
import currencySymbols from '../api/currencySymbols'
import { convertFromUSD } from '../api/ECBForexRates'

const useStyles = makeStyles(theme => ({
  paper: {
    marginTop: theme.spacing(1),
    padding: theme.spacing(2),
    display: 'flex',
    flexDirection: 'column',
  },
  paperAvatar: {
    borderRadius: '50%',
    marginTop: theme.spacing(-3),
  },
  rowAvatar: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  avatar: {
    width: theme.spacing(8),
    height: theme.spacing(8),
    justifyContent: 'center'
  },
  infoText: {
    //marginTop: '2px',
  },
  buttonSubscribe: {
    alignSelf: 'flex-end'
  },
  subscribeContainer: {
    marginTop: theme.spacing(2),
  },
  subscribePaper: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    transitionProperty: 'width',
    transitionDuration: '300ms',
    transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  subscribeForm: {
    // transition: 'width 225ms cubic-bezier(0.4, 0, 0.2, 1) 0ms'
    // transitionProperty: 'width',
  },
  form: {
    //backgroundColor: theme.palette.grey['A100']
  }
}));

function Profile({ subscription, currency }) {
  const classes = useStyles()
  const [displayName, setDisplayName] = React.useState(subscription.hostname)
  const [largeFaviconExists, setLargeFaviconExists] = React.useState(false)
  // const [avatarColor, setAvatarColor] = React.useState('')
  const [totalDonations, setTotalDonations] = React.useState(0)
  const [totalDonationsOneMonth, setTotalDonationsOneMonth] = React.useState(0)

  // React.useEffect(updateState, [subscription, currency])

  React.useEffect(() => {
    const { hostname } = subscription
    console.log(hostname)
    if (hostname) {
      getTotalDonations(hostname).then(td => {
        setTotalDonations(convertFromUSD(currency, td))
      })
      getTotalDonationsFromOneMonth(hostname).then(td => {
        setTotalDonationsOneMonth(convertFromUSD(currency, td))
      })
      const faviconUrlLarge = 'https://' + hostname + '/apple-touch-icon.png'
      let xhr = new XMLHttpRequest()
      xhr.open("GET", faviconUrlLarge, true)
      xhr.onloadend = () => {
        if (xhr.status !== 404 && xhr.status !== 0)
          setLargeFaviconExists(true)
        else
          setLargeFaviconExists(false)
      }
      xhr.send()
    } else {
      setTotalDonations(0)
      setTotalDonationsOneMonth(0)
      setLargeFaviconExists(false)
    }
    const parts = hostname.split('.')
    if (parts.length > 2 && parts[parts.length-3] === 'www')
      setDisplayName(parts[parts.length-2]+'.'+parts[parts.length-1])
    else
      setDisplayName(hostname)
  }, [subscription.hostname, currency])

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

  const faviconUrl = 'https://' + subscription.hostname + '/apple-touch-icon.png'
  console.log('faviconUrl', faviconUrl)
  const avatarLetter = displayName.charAt(0);
  const currencySymbol = currencySymbols[currency]

  const truncate = (str, len) => Array.from(str.substring(0, len)).map((c, i) => i!==len-1 ? c : String.fromCharCode(8230)).join('')


  // totalDonations = tx.convert(totalDonations, {from: "USD", to: settigs.curency})
  // totalDonationsOneMonth = tx.convert(totalDonationsOneMonth, {from: "USD", to: settigs.curency})
  return (
    <Paper className={classes.paper}>
      <div className={classes.rowAvatar}>
        <Paper className={classes.paperAvatar}>
          {largeFaviconExists ? <Avatar
            src={faviconUrl}
            className={classes.avatar}
            imgProps={{
              height: "57",
              width: "57",
              onError: () => setLargeFaviconExists(false)
            }}
          >
          </Avatar> :
          <Avatar style={{ height: 57, width: 57 }}>
            { avatarLetter.toUpperCase() }
          </Avatar>
          /*<svg height="57" width="57">
            <style>
              .heavy { font: 50px roboto; }
            </style>
            <circle cx="28" cy="28" r="28" fill="red" />
            <text text-anchor="middle" x="28" y="46" fill="white" class="heavy">
              { avatarLetter }
            </text>
          </svg>*/}
        </Paper>
      </div>
      <Tooltip title={subscription.hostname} enterDelay={300}>
        <Typography variant="h5">
          { truncate(displayName, 23) || String.fromCharCode('&nbsp') }
        </Typography>
      </Tooltip>
      <div>
        <Typography variant="body2" className={classes.infoText}>
          {currencySymbol + totalDonations.toFixed(2) + ' in total contributions'}
        </Typography>
        <Typography variant="body2" className={classes.infoText}>
          {currencySymbol + totalDonationsOneMonth.toFixed(2) + ' last month'}
        </Typography>
      </div>
      <div className={classes.subscribeContainer}>
        <SubscribeForm subscription={subscription} />
      </div>
    </Paper>
  )
}

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

const mapStateToProps = state => ({
  currency: state.settings['Currency']
})

export default connect(mapStateToProps)(Profile)


// componentDidUpdate(prevProps, prevState, snapshot) {
//   if (this.props.shortUrl !== prevProps.shortUrl) {
//     this.updateTotalDonations()
//   }
// }

// async updateTotalDonations() {
//   let nameHash = namehash.hash(this.props.shortUrl)
//   let account = await gratisContract.methods.accounts(nameHash).call({
//     from: web3js.eth.accounts.wallet[0].address
//   })
//   let totalDonations = account.
//   this.setState({
//     totalDonations: totalDonations
//   })
// }
