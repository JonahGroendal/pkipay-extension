import Web3Context from './Web3Context'
import FormSubscribe from './FormSubscribe'
import FormDonate from './FormDonate.js'
import namehash from 'eth-ens-namehash'
import React, { Component } from 'react'
import { withStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import Avatar from '@material-ui/core/Avatar'
import Typography from '@material-ui/core/Typography'

const styles = theme => ({
  root: {
    paddingLeft: theme.spacing.unit,
    paddingRight: theme.spacing.unit,
    paddingBottom: theme.spacing.unit,
  },
  paper: {
    marginTop: theme.spacing.unit * 8,
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
  buttonSubscribe: {
    alignSelf: 'flex-end'
  },
  subscribeContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
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

class Tab2 extends Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  render() {
    const { hostname, classes } = this.props
    const parts = hostname.split('.')
    const siteUrl = parts[parts.length-2]+'.'+parts[parts.length-1]
    // const faviconUrl = 'https://' + siteUrl + '/apple-touch-icon.png'
    const faviconUrl = 'https://' + hostname + '/apple-touch-icon.png'

    return (
      <div className={classes.root}>
        <Paper className={classes.paper}>
          <div className={classes.rowAvatar}>
            <Paper className={classes.paperAvatar}>
              <Avatar
                src={faviconUrl}
                className={classes.avatar}
                imgProps={{ height: "57", width: "57" }}
              >
                {/* hostname.split('.').slice(-2)[0].charAt(0) */}
              </Avatar>
            </Paper>
          </div>
          <Typography variant="headline">
            {siteUrl}
          </Typography>
          <Web3Context.Consumer>
            {({ cache }) => { return (
              <div>
                <p>total donations: {cache.entity.totalDonations}</p>
                <p>account exists: {cache.entity.accountExists ? 'true' : 'false'}</p>
              </div>
            )}}
          </Web3Context.Consumer>
          <FormSubscribe hostname={hostname}/>
        </Paper>
      </div>
    );
  }

}

export default withStyles(styles)(Tab2)

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
