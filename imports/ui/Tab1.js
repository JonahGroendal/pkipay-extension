import React, { Component } from 'react';
import http from 'meteor/http';
//import sslCert from 'get-ssl-certificate';

export default class Tab1 extends Component {
  get(url) {
    if (url.length <= 0 || typeof url !== 'string') {
      throw Error("A valid URL is required");
    }

    var options = {
      hostname: url,
      agent: false,
      rejectUnauthorized: false,
      ciphers: "ALL",
    };

    return new Promise(function (resolve, reject) {
      var req = http.get(options, function (res) {
        var certificate = res.socket.getPeerCertificate();
        if(isEmpty(certificate) || certificate === null) {
          reject({message: 'The website did not provide a certificate'});
        } else {
          resolve(certificate);
        }
      });

      req.on('error', function(e) {
        reject(e);
      });

      req.end();
    });
  }

  getCert() {
    return http.HTTP.get('https://nodejs.org/en/', {}, function (error, response) {
      if ( error ) {
        console.log( "error", error );
      } else {
        console.log( "res", response );
      }
    });
  }

  render() {
    console.log("result", this.getCert());
    return (
      <div>
        <h1>Tab1</h1>
        <p>sam</p>
      </div>
    );
  }
}
