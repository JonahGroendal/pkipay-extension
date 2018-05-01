import React, { Component } from 'react';

const divStyle = {
  margin: 0,
  height: '50px',
  backgroundColor: 'blue',
}

export default class TopBar extends Component {
  getShortUrl(url) {
    if (url.substring(0, 4) !== 'http') {
      return "";
    }
    let parts = url.split(".", 3);
    return parts[1] + '.' + parts[2].split("/", 1);
  }

  render() {
    return (
      <div style={divStyle}>
        <h1>{this.getShortUrl(this.props.url)}</h1>
      </div>
    );
  }

}
