import React, { Component } from 'react';
// import http from 'meteor/http';
// import sslCert from 'get-ssl-certificate';
// import forge from 'node-forge';
// import net from 'net-socket';

export default class Tab1 extends Component {
  // get(url) {
  //   if (url.length <= 0 || typeof url !== 'string') {
  //     throw Error("A valid URL is required");
  //   }
  //
  //   var options = {
  //     hostname: url,
  //     agent: false,
  //     rejectUnauthorized: false,
  //     ciphers: "ALL",
  //   };
  //
  //   return new Promise(function (resolve, reject) {
  //     var req = http.get(options, function (res) {
  //       var certificate = res.socket.getPeerCertificate();
  //       if(isEmpty(certificate) || certificate === null) {
  //         reject({message: 'The website did not provide a certificate'});
  //       } else {
  //         resolve(certificate);
  //       }
  //     });
  //
  //     req.on('error', function(e) {
  //       reject(e);
  //     });
  //
  //     req.end();
  //   });
  // }
  //
  // getCert() {
  //   return http.HTTP.get('http://www.google.com', {}, function (error, response) {
  //     if ( error ) {
  //       console.log( "error", error );
  //     } else {
  //       console.log( "res", response );
  //       console.log( response.socket.getPeerCertificate() );
  //     }
  //   });
  // }
  //
  // tryForge() {
  //   var socket = net.connect(443, 'google.com');
  //
  //   var client = forge.tls.createConnection({
  //     server: false,
  //     verify: function(connection, verified, depth, certs) {
  //       // skip verification for testing
  //       console.log('[tls] server certificate verified');
  //       return true;
  //     },
  //     connected: function(connection) {
  //       console.log('[tls] connected');
  //       // prepare some data to send (note that the string is interpreted as
  //       // 'binary' encoded, which works for HTTP which only uses ASCII, use
  //       // forge.util.encodeUtf8(str) otherwise
  //       client.prepare('GET / HTTP/1.0\r\n\r\n');
  //     },
  //     tlsDataReady: function(connection) {
  //       // encrypted data is ready to be sent to the server
  //       var data = connection.tlsData.getBytes();
  //       socket.write(data, 'binary'); // encoding should be 'binary'
  //     },
  //     dataReady: function(connection) {
  //       // clear data from the server is ready
  //       var data = connection.data.getBytes();
  //       console.log('[tls] data received from the server: ' + data);
  //     },
  //     closed: function() {
  //       console.log('[tls] disconnected');
  //     },
  //     error: function(connection, error) {
  //       console.log('[tls] error', error);
  //     }
  //   });
  //
  //   socket.on('connect', function() {
  //     console.log('[socket] connected');
  //     client.handshake();
  //   });
  //   socket.on('data', function(data) {
  //     client.process(data.toString('binary')); // encoding should be 'binary'
  //   });
  //   socket.on('end', function() {
  //     console.log('[socket] disconnected');
  //   });
  // }
  //
  // tryChrome() {
  //   console.log(chrome);
  //   console.log(chrome.sockets);
  //   chrome.sockets.tcp.create({}, (createInfo) => {
  //     chrome.sockets.tcp.connect(createInfo.socketId, 443, 'https://www.google.com/', (result) => {
  //       console.log("result: " + result);
  //     })
  //   })
  // }
  //
  // trySslCert() {
  //   sslCert.get('nodejs.org').then(function (certificate) {
  //     console.log(certificate);
  //     // certificate is a JavaScript object
  //
  //     console.log(certificate.issuer);
  //     // { C: 'GB',
  //     //   ST: 'Greater Manchester',
  //     //   L: 'Salford',
  //     //   O: 'COMODO CA Limited',
  //     //   CN: 'COMODO RSA Domain Validation Secure Server CA' }
  //
  //     console.log(certificate.valid_from)
  //     // 'Nov  8 00:00:00 2015 GMT'
  //
  //     console.log(certificate.valid_to)
  //     // 'Aug 22 23:59:59 2017 GMT'
  //   });
  // }
  render() {
    //console.log("get: " + this.trySslCert());
    return (
      <div>
        <h1>Tab1</h1>
        <p>sam</p>
      </div>
    );
  }
}
