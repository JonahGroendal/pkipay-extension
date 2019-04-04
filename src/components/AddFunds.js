import web3js from '../api/web3js'
import React, { Component } from 'react'
import Typography from '@material-ui/core/Typography'
import { withStyles } from '@material-ui/core/styles'

const styles = theme => ({
  publicKey: {
    overflow: 'auto'
  }
})

class AddFunds extends Component {
  constructor(props) {
    super(props)

    this.asyncLoad = this.asyncLoad.bind(this)
    this.componentDidMount = this.componentDidMount.bind(this)
  }

  componentDidMount() {
    if (window.attachEvent) {
      window.attachEvent('onload', this.asyncLoad);
    } else {
      window.addEventListener('load', this.asyncLoad, false);
    }
  }

  asyncLoad() {
    var s = document.createElement('script');
    s.type = 'text/javascript';
    s.async = true;
    var theUrl = "https://buy.coinbase.com/static/widget.js";
    s.src = theUrl+ (theUrl.indexOf("?") >= 0 ? '&' : '?') + 'ref=' + encodeURIComponent(window.location.href);
    var embedder = document.getElementById('coinbase_widget_loader');
    embedder.parentNode.insertBefore(s, embedder);
  }

  render() {
    const { classes } = this.props
    return (
      <div>
        <Typography variant="h6">
          Send ETH to:
        </Typography>
        <Typography variant="subtitle1" className={classes.publicKey}>
           {web3js.eth.accounts.wallet[0].address}
        </Typography>
        <a className="coinbase-widget"
           id="coinbase_widget"
           data-address="1JcssT2Cr2xhnfcYscLL1bZPbojg4rUC2X"
           data-code="9023urn3f8934hg34"
           href="">Buy bitcoin using Coinbase</a>
      </div>
    )
  }
}

export default withStyles(styles)(AddFunds)
