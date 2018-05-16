import React, { Component } from 'react';

const divStyle = {
  margin: 0,
  height: '50px',
  backgroundColor: 'blue',
}

export default class TopBar extends Component {

  render() {
    return (
      <div style={divStyle}>
        <h1>{this.props.shortUrl}</h1>
      </div>
    );
  }

}
