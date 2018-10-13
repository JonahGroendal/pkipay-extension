import React, { Component } from 'react'
import Table from './Table'
import TableRow from '@material-ui/core/TableRow'
import TableCell from '@material-ui/core/TableCell'
import { withStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'

const styles = theme => ({
  paper: {
    paddingTop: theme.spacing.unit * 2,
    paddingRight: theme.spacing.unit * 2,
    paddingBottom: theme.spacing.unit * 2,
    paddingLeft: theme.spacing.unit * 2,
  },
  tableRow: {
    cursor: 'pointer',
  },
})

class MostiewedSites extends Component {
  constructor(props) {
    super(props)
    this.state = {
      views: [],
      sites: [],
    }
  }

  async componentWillMount() {
    this.getViews()
    .then(rawViews => {
      let views = []
      rawViews.forEach(rawView => {
        let name = rawView.name
        if (name === rawView.hostname) {
          name = this.formatHostname(name)
        }
        views.push({
          id: rawView.siteId,
          name: name,
          hostname: rawView.hostname,
          duration: this.formatDuration(rawView.duration),
          views: rawView.views,
          share: rawView.share
        }) // Using siteId as id might be problematic
      })
      this.setState({
        views: views
      })
    })
    .catch(console.log)
  }

  // Views must be gotten via background.js due to BATify's use of the storagedb.js
  // background page
  getViews() {
    let browser = this.props.browser
    return new Promise(function(resolve, reject) {
      browser.runtime.sendMessage({action: "getViews"}, function(views) {
        if (browser.runtime.lastError) {
          reject(browser.runtime.lastError)
        }
        else {
          resolve(views)
        }
      });
    })
  }

  formatHostname(hostname)
  {
    let parts = hostname.split(".")
    return parts[parts.length-2].slice(0, 1).toUpperCase() + parts[parts.length-2].slice(1)
  }

  formatDuration(duration)
  {
     var hours = Math.floor(duration/3600)
     duration %= 3600
     var minutes = Math.floor(duration/60)
     var seconds = Math.floor(duration % 60)

     return hours.toString().padStart(2, "0") + ":" + minutes.toString().padStart(2, "0") + ":" + seconds.toString().padStart(2, "0")
  }

  render() {
    if (!this.state.views) return
    const { classes } = this.props
    const { views } = this.state
    const headerCells = [
      {label: 'Name', width: '70%', sortable: true, cellProps: {key: 'name', padding: 'default', numeric: false}},
      {label: 'Share', width: '30%', sortable: true, cellProps: {key: 'share', padding: 'dense', numeric: true}},
      {label: '', width: '14%', sortable: false, cellProps: {key: 'delete', padding: 'none', numeric: false}},
    ]
    return (
      <Table
        className={classes.table}
        headerCells={headerCells}
        rowsData={views}
        rowsPerPage={4}
      >
        {(id, name, hostname, share) => <TableRow className={classes.tableRow} hover key={id}>
          <TableCell className={classes.tableCell}>
            <Typography variant="subheading">
              {hostname}
            </Typography>
          </TableCell>
          <TableCell className={classes.tableCell} numeric={true} padding="none">
            <Typography variant="subheading">
              {share}
            </Typography>
          </TableCell>
          <TableCell className={classes.tableCell} numeric={true}>
            <Typography variant="subheading">
              UNSUB
            </Typography>
          </TableCell>
        </TableRow>}
      </Table>
    )
  }
}

export default withStyles(styles)(MostiewedSites)
