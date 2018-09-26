/*global browser*/
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

const styles = theme => ({
  root: {
    width: '98%',
    marginLeft: '1%',
    marginRight: '1%',
    marginTop: theme.spacing.unit * 3,
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    tableLayout: 'fixed'
  },
  nameColumn: {
    width: '38%'
  },
  shareColumn: {
    width: '17%',
  },
  durationColumn: {
    width: '25%'
  },
  viewsColumn: {
    width: '20%'
  }
});

class ViewsTable extends Component {
  constructor(props) {
    super(props)
    this.state = {
      views: []
    }
    this.getViews = this.getViews.bind(this)
  }

  async componentDidMount() {
    let rawViews = await this.getViews()
    let views = []
    rawViews.forEach(rawView => {
      let name = rawView.name
      if (rawView.name === rawView.hostname) {
        name = this.formatHostname(name)
      }
      views.push({
        id: rawView.siteId,
        name: name,
        duration: this.formatDuration(rawView.duration),
        views: rawView.views,
        share: rawView.share
      }) // Using siteId as id might be problematic
    })

    this.setState({
      views: views.sort((a, b) => (a.share < b.share ? -1 : 1))
    })
  }

  getViews() {
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
     var parts = hostname.split(".");
     return parts[parts.length - 2] + "." + parts[parts.length - 1];
  }

  formatDuration(duration)
  {
     var hours = Math.floor(duration/3600);
     duration %= 3600;
     var minutes = Math.floor(duration/60);
     var seconds = Math.floor(duration % 60);

     return hours.toString().padStart(2, "0") + ":" + minutes.toString().padStart(2, "0") + ":" + seconds.toString().padStart(2, "0");
  }

  render() {
    return (
      <Paper className={this.props.classes.root}>
        <Table className={this.props.classes.table}>
          <TableHead>
            <TableRow>
              <TableCell padding='dense' className={this.props.classes.nameColumn}>Site</TableCell>
              <TableCell numeric padding='dense' className={this.props.classes.shareColumn}>%</TableCell>
              <TableCell numeric padding='dense' className={this.props.classes.durationColumn}>Time Spent</TableCell>
              <TableCell numeric padding='dense' className={this.props.classes.viewsColumn}>Views</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {this.state.views.map(n => {
              return (
                <TableRow key={n.id}>
                  <TableCell padding='dense' component="th" scope="row">
                    {n.name}
                  </TableCell>
                  <TableCell padding='dense' numeric>{n.share}</TableCell>
                  <TableCell padding='dense' numeric>{n.duration}</TableCell>
                  <TableCell padding='dense' numeric>{n.views}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Paper>
    );
  }
}

export default withStyles(styles)(ViewsTable)
