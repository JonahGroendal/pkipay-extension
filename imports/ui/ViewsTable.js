/*global browser*/
import React, { Component } from 'react';
import EnhancedTable from './EnhancedTable'
import SimpleTable from './SimpleTable'

let counter = 0;
function createData(name, calories, fat, carbs, protein) {
  counter += 1;
  return { id: counter, name, calories, fat, carbs, protein };
}

const columnData = [
  { id: 'name', numeric: false, disablePadding: true, label: 'Site' },
  { id: 'duration', numeric: true, disablePadding: false, label: 'Time Viewed (s)' }
];
const data = [
  {id: 1, name: "www.samsung.com", duration: 15.204},
  {id: 2, name: "www.sprint.com", duration: 2.111}
]
// { id: 'name', numeric: false, disablePadding: true, label: 'Dessert (100g serving)' },
// { id: 'calories', numeric: true, disablePadding: false, label: 'Calories' },
// { id: 'fat', numeric: true, disablePadding: false, label: 'Fat (g)' },
// { id: 'carbs', numeric: true, disablePadding: false, label: 'Carbs (g)' },
// { id: 'protein', numeric: true, disablePadding: false, label: 'Protein (g)' },
// const data = [
//   createData('Cupcake', 305, 3.7, 67, 4.3),
//   createData('Donut', 452, 25.0, 51, 4.9),
//   createData('Eclair', 262, 16.0, 24, 6.0),
//   createData('Frozen yoghurt', 159, 6.0, 24, 4.0),
//   createData('Gingerbread', 356, 16.0, 49, 3.9),
//   createData('Honeycomb', 408, 3.2, 87, 6.5),
//   createData('Ice cream sandwich', 237, 9.0, 37, 4.3),
//   createData('Jelly Bean', 375, 0.0, 94, 0.0),
//   createData('KitKat', 518, 26.0, 65, 7.0),
//   createData('Lollipop', 392, 0.2, 98, 0.0),
//   createData('Marshmallow', 318, 0, 81, 2.0),
//   createData('Nougat', 360, 19.0, 9, 37.0),
//   createData('Oreo', 437, 18.0, 63, 4.0),
// ].sort((a, b) => (a.calories < b.calories ? -1 : 1))

export default class ViewsTable extends Component {
  constructor(props) {
    super(props)
    this.state = {
      views: []
    }
    this.getViews = this.getViews.bind(this)
  }

  async componentDidMount() {
    let rawViews = await this.getViews()
    console.log(rawViews)
    let views = []
    rawViews.forEach(rawView => {
      views.push({id: ++counter, name: rawView.name, duration: rawView.duration}) // Using siteId as id might be problematic
    })
    this.setState({
      views: views.sort((a, b) => (a.duration < b.duration ? -1 : 1))
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

  render() {
    return (
      <SimpleTable data={this.state.views} />
    );
  }
}
