import React, { Component } from 'react'
import { Line, Chart } from 'react-chartjs-2'
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
  buttonRow: {
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: theme.spacing.unit * 2,
  },
  button: {
    //textTransform: 'none'
  },
  chart: {

  }
})

console.log(Chart.defaults)
const chartDataTime = {
  datasets: [{
    pointHitRadius: 30,
    label: 'Price',
    data: [{
      x: new Date((new Date(Date.now())).getFullYear(), (new Date(Date.now())).getMonth()),
      y: 1
    }, {
      t: new Date((new Date(Date.now())).getFullYear(), (new Date(Date.now())).getMonth() - 1),
      y: 1
    }, {
      t: new Date((new Date(Date.now())).getFullYear(), (new Date(Date.now())).getMonth() - 2),
      y: 2
    }, {
      t: new Date((new Date(Date.now())).getFullYear(), (new Date(Date.now())).getMonth() - 3),
      y: 2
    }, {
      t: new Date((new Date(Date.now())).getFullYear(), (new Date(Date.now())).getMonth() - 4),
      y: 2
    }, {
      t: new Date((new Date(Date.now())).getFullYear(), (new Date(Date.now())).getMonth() - 5),
      y: 2
    }, {
      t: new Date((new Date(Date.now())).getFullYear(), (new Date(Date.now())).getMonth() - 6),
      y: 3
    }, {
      t: new Date((new Date(Date.now())).getFullYear(), (new Date(Date.now())).getMonth() - 7),
      y: 10
    }, {
      t: new Date((new Date(Date.now())).getFullYear(), (new Date(Date.now())).getMonth() - 8),
      y: 10
    }]
  }]
}
Chart.defaults.global.defaultFontFamily = "'Roboto', 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif"
const chartOptionsTime = {
  title: {
    display: true,
    text: "Auction Price (in ETH)",
    fontSize: 14,
  },
  legend: {
    display: false
  },
  elements: {
    line: {
        tension: 0, // disables bezier curves
    }
  },
  scales: {
    xAxes: [{
      type: 'time',
      distribution: 'series'
    }],
    yAxes: [{
      scaleLabel: {
        display: false,
        labelString: 'Price'
      }
    }]
  }
}
const chartOptions = {
  legend: {
    display: false
  },
  elements: {
    line: {
        tension: 0, // disables bezier curves
    }
  },
  scales: {
    yAxes: [{
      scaleLabel: {
        display: true,
        labelString: 'Price (ETH)'
      }
    }],
    xAxes: [{
      time: {
        unit: 'month'
      },
      scaleLabel: {
        display: true,
        labelString: 'Time'
      },
      ticks: {
        display: false
      }
    }]
  }
}

class Token extends Component {
  constructor(props) {
    super(props)
    this.state = {
      expanded: false,
    }
  }

  render() {
    const { classes } = this.props
    const { expanded } = this.state
    //const tempData = [.0001, .0001, .0002, .00025, .00025, .00029]
    //chartDataTime.datasets[0].data = tempData
    return (
      <Paper className={classes.paper}>
        <div className={classes.chart}>
          <Line data={chartDataTime} options={chartOptionsTime}/>
          <div className={classes.buttonRow}>
            <Typography variant="title">
              $1.02 per token
            </Typography>
            <Button
            className={classes.button}
              onClick={this.handleClickBuy}
              variant={expanded ? "outlined" : "contained"}
              size="medium"
              color="primary"
            >
              Buy THX
            </Button>
          </div>
        </div>
      </Paper>
    )
  }
}

export default withStyles(styles)(Token)
