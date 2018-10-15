import Web3Context from './Web3Context'
import FormSubscribe from './FormSubscribe'
import browser from './api/browser'
import namehash from 'eth-ens-namehash'
import React, { Component } from 'react'
import { withStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import Avatar from '@material-ui/core/Avatar'
import Typography from '@material-ui/core/Typography'
import getPixels from 'get-pixels'

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
      largeFaviconExists: false,
      avatarColor: ''
    }
    this.updateState()
  }

  componentDidUpdate(prevProps) {
    if (prevProps.hostname !== this.props.hostname)
      this.updateState()
  }

  updateState = () => {
    const { hostname } = this.props
    if (hostname === '') {
      browser.tabs.query({'active': true, 'lastFocusedWindow': true}, (tabs) => {
        this.setState({
          displayName: tabs[0].url,
          subscribable: false,
          largeFaviconExists: false,
          avatarColor: '#bdbdbd'
        })
      })
    } else if (hostname.includes('#')){
      this.setState({
        displayName: hostname,
        subscribable: false,
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
          this.setState({ displayName: displayName, subscribable: subscribable, largeFaviconExists: true })
        } else {
          // Else get mode of small favicon colors array and set state
          const faviconUrlSmall = 'https://www.google.com/s2/favicons?domain=' + hostname
          getPixels(faviconUrlSmall, (err, pixels) => {
            if (err) {
              this.setState({ displayName: displayName, subscribable: subscribable, largeFaviconExists: false, avatarColor: '#bdbdbd' })
            } else {
              let colors = []
              for (let i=0; i<pixels.data.length/4; i++) {
                colors.push(pixels.data[i*4].toString(16) + pixels.data[i*4+1].toString(16) + pixels.data[i*4+2].toString(16))
              }
              let avatarColor = '#' + mode(colors.filter(color => color !== "000"))
              if (avatarColor === '#ffffff') avatarColor = '#bdbdbd'
              this.setState({ displayName: displayName, subscribable: subscribable, largeFaviconExists: false, avatarColor: avatarColor })
            }
          })
        }
      }
      xhr.send()
    }
  }

  render() {
    const { hostname, classes } = this.props
    const { displayName, subscribable, largeFaviconExists, avatarColor } = this.state
    // const parts = hostname.split('.')
    // let siteUrl = ''
    // if (parts.length >= 2)
    //   siteUrl = hostname.includes("#") ? hostname : parts[parts.length-2]+'.'+parts[parts.length-1]

    const faviconUrl = 'https://' + hostname + '/apple-touch-icon.png'
    const avatarLetter = displayName.charAt(0)

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
        {subscribable && <Web3Context.Consumer>
          {cache => { return (
            <div>
              <Typography variant="body1" className={classes.infoText}>
                {'$' + cache.object.donationsTotal + ' in total contributions'}
              </Typography>
              <Typography variant="body1" className={classes.infoText}>
                {'$' + cache.object.donationsLastMonth + ' per month'}
              </Typography>
              <Typography variant="body1" className={classes.infoText}>
                {cache.object.tokenSupply + 'THX in return'}
              </Typography>
            </div>
          )}}
        </Web3Context.Consumer>}
        {subscribable && <div className={classes.subscribeContainer}>
          <FormSubscribe hostname={hostname} />
        </div>}
      </Paper>
    );
  }

}

export default withStyles(styles)(Profile)

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