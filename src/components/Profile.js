import React, { Component } from 'react'
import { connect } from 'react-redux'
import FormSubscribe from './FormSubscribe'
import browser from '../api/browser'
import blockchain from '../api/blockchain'
import namehash from 'eth-ens-namehash'
import { withStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import Avatar from '@material-ui/core/Avatar'
import Typography from '@material-ui/core/Typography'
import getPixels from 'get-pixels'
import strings from '../api/strings'
import { convertFromUSD } from '../api/ECBForexRates'

const mode = function (array) {
  if(array.length == 0)
      return null;
  var modeMap = {};
  var maxEl = array[0], maxCount = 1;
  for(var i = 0; i < array.length; i++)
  {
      var el = array[i];
      if(modeMap[el] == null)
          modeMap[el] = 1;
      else
          modeMap[el]++;
      if(modeMap[el] > maxCount)
      {
          maxEl = el;
          maxCount = modeMap[el];
      }
  }
  return maxEl;
}

class Profile extends Component {
  constructor(props) {
    super(props)
    this.state = {
      displayName: '',
      subscribable: false,
      globalEntity: false,
      largeFaviconExists: false,
      avatarColor: '',
      totalDonations: 0,
      totalDonationsOneMonth: 0,
    }
  }
  componentDidMount() {
    this.updateState()
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.subscription.hostname !== this.props.subscription.hostname
      || prevProps.currency !== this.props.currency
    ) {
      this.updateState()
    }
  }

  updateState = () => {
    const { hostname, name } = this.props.subscription
    if (hostname !== '') {
      this.setState({ totalDonations: 0, totalDonationsOneMonth: 0 })
      Promise.all([
        blockchain.getTotalDonations(hostname),
        blockchain.getTotalDonationsFromOneMonth(hostname)
      ]).then(([totalDonations, totalDonationsOneMonth]) => {
        this.setState({
          totalDonations: convertFromUSD(this.props.currency, totalDonations),
          totalDonationsOneMonth: convertFromUSD(this.props.currency, totalDonationsOneMonth)
        })
      })
    }
    if (hostname === '') {
      browser.tabs.query({'active': true, 'lastFocusedWindow': true}, (tabs) => {
        this.setState({
          displayName: tabs[0].url,
          subscribable: false,
          globalEntity: true,
          largeFaviconExists: false,
          avatarColor: '#bdbdbd'
        })
      })
    } else if (hostname.includes('#')){
      const displayName = name ? name : hostname
      this.setState({
        displayName: displayName,
        subscribable: true,
        globalEntity: false,
        largeFaviconExists: false,
        avatarColor: '#bdbdbd'
      })
    } else {
      //console.log(hostname)
      const parts = hostname.split('.')
      let displayName
      let subscribable
      if (hostname.includes("#") || parts.length < 2) {
        displayName = hostname
        subscribable = false
      } else {
        displayName = parts[parts.length-2]+'.'+parts[parts.length-1]
        subscribable = true
      }
      // Check if large favicon exists
      const faviconUrlLarge = 'https://' + hostname + '/apple-touch-icon.png'
      let xhr = new XMLHttpRequest()
      xhr.open("GET", faviconUrlLarge, true)
      xhr.onloadend = () => {
        let largeFaviconExists = (xhr.status !== 404 && xhr.status !== 0)
        console.log("xhr.status: ", xhr.status)
        if (largeFaviconExists) {
          // If so, set state
          this.setState({
            displayName: displayName,
            subscribable: subscribable,
            globalEntity: true,
            largeFaviconExists: true
          })
        } else {
          // Else get mode of small favicon colors array and set state
          const faviconUrlSmall = 'https://www.google.com/s2/favicons?domain=' + hostname
          getPixels(faviconUrlSmall, (err, pixels) => {
            if (err) {
              this.setState({
                displayName: displayName,
                subscribable: subscribable,
                globalEntity: true,
                largeFaviconExists: false,
                avatarColor: '#bdbdbd'
              })
            } else {
              let colors = []
              for (let i=0; i<pixels.data.length/4; i++) {
                colors.push(pixels.data[i*4].toString(16) + pixels.data[i*4+1].toString(16) + pixels.data[i*4+2].toString(16))
              }
              let avatarColor = '#' + mode(colors.filter(color => color !== "000"))
              if (avatarColor === '#ffffff') avatarColor = '#bdbdbd'
              this.setState({
                displayName: displayName,
                subscribable: subscribable,
                globalEntity: true,
                largeFaviconExists: false,
                avatarColor: avatarColor })
            }
          })
        }
      }
      xhr.send()
    }
  }

  render() {
    const { classes, subscription } = this.props
    const { displayName, subscribable, globalEntity, largeFaviconExists, avatarColor } = this.state
    // const parts = hostname.split('.')
    // let siteUrl = ''
    // if (parts.length >= 2)
    //   siteUrl = hostname.includes("#") ? hostname : parts[parts.length-2]+'.'+parts[parts.length-1]

    const faviconUrl = 'https://' + subscription.hostname + '/apple-touch-icon.png'
    const avatarLetter = displayName.charAt(0);
    const currencySymbol = strings.currency[this.props.currency]


    // totalDonations = tx.convert(totalDonations, {from: "USD", to: settigs.curency})
    // totalDonationsOneMonth = tx.convert(totalDonationsOneMonth, {from: "USD", to: settigs.curency})
    return (
      <Paper className={classes.paper}>
        <div className={classes.rowAvatar}>
          <Paper className={classes.paperAvatar}>
            {largeFaviconExists ? <Avatar
              src={faviconUrl}
              className={classes.avatar}
              imgProps={{ height: "57", width: "57" }}
            >
            </Avatar> :
            <Avatar style={{ backgroundColor: avatarColor, height: 57, width: 57 }}>
              { avatarLetter }
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
        <Typography variant="headline">
          { displayName }
        </Typography>
        {subscribable && globalEntity && <div>
          <Typography variant="body1" className={classes.infoText}>
            {currencySymbol + this.state.totalDonations.toFixed(2) + ' in total contributions'}
          </Typography>
          <Typography variant="body1" className={classes.infoText}>
            {currencySymbol + this.state.totalDonationsOneMonth.toFixed(2) + ' last month'}
          </Typography>
        </div>}
        {subscribable && <div className={classes.subscribeContainer}>
          <FormSubscribe subscription={subscription} />
        </div>}
      </Paper>
    );
  }
}

const styles = theme => ({
  paper: {
    marginTop: theme.spacing.unit * 1,
    padding: theme.spacing.unit * 2,
    display: 'flex',
    flexDirection: 'column',
  },
  paperAvatar: {
    borderRadius: '50%',
    marginTop: theme.spacing.unit * -3,
  },
  rowAvatar: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  avatar: {
    width: theme.spacing.unit * 8,
    height: theme.spacing.unit * 8,
    justifyContent: 'center'
  },
  infoText: {
    //marginTop: '2px',
  },
  buttonSubscribe: {
    alignSelf: 'flex-end'
  },
  subscribeContainer: {
    marginTop: theme.spacing.unit * 2,
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
})

const mapStateToProps = state => ({
  currency: state.settings.currency
})

export default connect(mapStateToProps)(withStyles(styles)(Profile))


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
