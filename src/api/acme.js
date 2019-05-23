//@ts-check

import jws from 'jws'
import { ec as EC } from 'elliptic'
import forge from 'node-forge'
import asn1js from 'asn1.js'
import BN from 'bn.js'
import crypto from 'crypto'

let directory
let nonce

// const privKey = "-----BEGIN EC PRIVATE KEY-----MHcCAQEEICn8T44YIJvW8YijgGfzjAjPpNKoVToBUyqL/DfdqG9joAoGCCqGSM49AwEHoUQDQgAEe7R8OKtsZREJGOzvNi9woyzyVSgBEe8fQFrNabzOMBwmyyPjq21zBBV6Xac4HrQYrWwfLsqXWOVxN2BY3HU1oA==-----END EC PRIVATE KEY-----"
// function privKeyToPem(privKeyBytes) {
//   const asn1 = forge.asn1.create(forge.asn1.Class.UNIVERSAL, forge.asn1.Type.SEQUENCE, true, [
//     forge.asn1.create(forge.asn1.Class.UNIVERSAL, forge.asn1.Type.INTEGER, false, (new Number(1)).toString(16)),
//     forge.asn1.create(forge.asn1.Class.UNIVERSAL, forge.asn1.Type.OCTETSTRING, false, privKeyBytes)
//   ])
//   const der = forge.asn1.toDer(asn1).getBytes()
//   //return '-----BEGIN EC PRIVATE KEY-----'+forge.util.encode64(der)+'-----END EC PRIVATE KEY-----'
//   return forge.util.encode64(der)
// }
// function keyToPem(ecdh) {
//   let ECPrivateKey = asn1js.define('ECPrivateKey', function() {
//     this.seq().obj(
//       this.key('version').int(),
//       this.key('privateKey').octstr(),
//       this.key('parameters').explicit(0).objid().optional(),
//       this.key('publicKey').explicit(1).bitstr().optional()
//     );
//   });
//   return ECPrivateKey.encode({
//       version: new BN(1),
//       privateKey: ecdh.getPrivateKey(), // A Buffer
//       parameters: '1.2.840.10045.3.1.7'.split('.').map((s) => parseInt(s, 10))
//     },
//     'pem',
//     { label: "EC PRIVATE KEY" }
//   )
// }

export async function getNewNonce() {
  if (!directory)
    directory = await getDirectory()
  const res = await fetch(directory.newNonce, {
    method: "HEAD"
  })
  return res.headers.get('Replay-Nonce')
}

export async function postNewAccount() {
  // function base64Url(buf) {
  //   return buf.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  // }

  // let ec = new EC('p256');
  // let key = ec.genKeyPair();
  // console.log(key);
  // let pemKey = keyToPem(key.getPrivate().toString(16))
  // console.log(pemKey)

  // let ecdh = crypto.createECDH('p256')
  // ecdh.generateKeys()
  // console.log(ecdh)
  // let pemKey = keyToPem(ecdh)
  // console.log(ecdh.getPublicKey())
  // console.log(ecdh.keys.pub.x.toArrayLike(Buffer, 'be'))
  // console.log(base64Url(ecdh.keys.pub.x.toArrayLike(Buffer, 'be')))
  // console.log(ecdh.getPublicKey('hex'))
  // const jwk = {
  //   "crv":"P-256",
  //   "kty":"EC",
  //   "x": base64Url(ecdh.keys.pub.x.toArrayLike(Buffer, 'le')),
  //   "y": base64Url(ecdh.keys.pub.y.toArrayLike(Buffer, 'le')),
  // }
  // console.log(jwk)

  if (!nonce)
    nonce = await getNewNonce()
  if (!directory)
    directory = await getDirectory()

  const privJwk = await generateJwk()
  const pubJwk = {
    "crv": privJwk.crv,
    "kty": privJwk.kty,
    "x": privJwk.x,
    "y": privJwk.y,
  }
  const header = {
    nonce: nonce,
    url: directory.newAccount,
    alg: 'ES256',
    jwk: pubJwk
  }
  const payload = {
    termsOfServiceAgreed: true
  }

  const jwt = await jwtFromJson(privJwk, header, payload)
  const jwtParts = jwt.split('.')
  const parsedJwt = {
    protected: jwtParts[0],
    payload: jwtParts[1],
    signature: jwtParts[2]
  }
  console.log(jwt)

  // const encoded = jws.sign({
  //   header: {
  //     nonce: nonce,
  //     url: directory.newAccount,
  //     alg: 'ES256',
  //     jwk: jwk
  //   },
  //   payload: {
  //     termsOfServiceAgreed: true,
  //   },
  //   privateKey: pemKey
  // })
  // console.log(encoded)
  // const parts = encoded.split('.')
  // console.log(jws.decode(encoded).signature === parts[2])
  const res = await fetch(directory.newAccount, {
    mode: "cors",
    method: "POST",
    headers: { "Content-Type": "application/jose+json" },
    body: JSON.stringify(parsedJwt)
  })
  res.json().then(console.log)
  nonce = res.headers.get('Replay-Nonce');
  let accountId = res.headers.get('Location');
  console.log('Next nonce:', nonce);
  console.log('Location/kid:', accountId);
}

async function postNewOrder() {
    
}

async function getDirectory() {
  // production url: https://acme-v02.api.letsencrypt.org
  const res = await fetch('https://acme-staging-v02.api.letsencrypt.org/directory')
  return await res.json()
}

async function generateJwk() {
  const keyPair = await window.crypto.subtle.generateKey(
    { name: "ECDSA", namedCurve: "P-256" },
    true,
    [ 'sign', 'verify' ]
  )
  return await window.crypto.subtle.exportKey('jwk', keyPair.privateKey)
}

async function jwtFromJson(jwk, header, payload) {
  function jsonToBase64Url(json) {
    return window.btoa(JSON.stringify(json)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
  }
  const privateKey = await window.crypto.subtle.importKey('jwk', jwk, { name: "ECDSA", namedCurve: "P-256"}, false, ['sign'])
  const base64Header = jsonToBase64Url(header)
  const base64Payload = jsonToBase64Url(payload)
  const sig = await window.crypto.subtle.sign(
    { name: "ECDSA", hash: { name: "SHA-256" } },
    privateKey,
    (new TextEncoder()).encode(base64Header + '.' + base64Payload)
  )
  const base64Signature = window.btoa(Array.prototype.map.call(new Uint8Array(sig), function (ch) {
    return String.fromCharCode(ch);
  }).join('')).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');

  return base64Header + '.' + base64Payload + '.' + base64Signature
}
