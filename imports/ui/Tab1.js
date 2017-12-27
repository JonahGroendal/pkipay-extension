import React, { Component } from 'react';
import sslCert from 'get-ssl-certificate';

export default class Tab1 extends Component {
  getCert() {
    sslCert.get('nodejs.org').then(function (certificate) {
      console.log(certificate);
    })
  }
  render() {
    return (
      <div>
        <h1>Tab1</h1>
        <p>{this.getCert()}</p>
      </div>
    );
  }
}
