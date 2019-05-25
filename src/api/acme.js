//@ts-check

import forge from 'node-forge'

let directory
let nonce

export default {
  generateJwk,
  postNewAccount,
  postNewOrder,
  postOrderChallenge,
  getOrderAuthorization,
  postOrderFinalize
}

async function thumbprint(jwk) {
  const pubJwk = {
    crv: jwk.crv,
    kty: jwk.kty,
    x: jwk.x,
    y: jwk.y
  }
  const hash = await window.crypto.subtle.digest(
    { name: "SHA-256" },
    (new TextEncoder()).encode(JSON.stringify(pubJwk))
  )

  return arrayBufferToBase64Url(hash);
}

async function getDirectory() {
  // production url: https://acme-v02.api.letsencrypt.org
  const res = await fetch('https://acme-staging-v02.api.letsencrypt.org/directory')
  directory = await res.json()
  console.log(directory)
}

async function getNewNonce() {
  if (!directory) await getDirectory()
  const res = await fetch(directory.newNonce, {
    method: "HEAD"
  })
  console.log("nonce: "+res.headers.get('Replay-Nonce'))
  nonce = res.headers.get('Replay-Nonce')
}

export async function generateJwk() {
  const keyPair = await window.crypto.subtle.generateKey(
    { name: "ECDSA", namedCurve: "P-256" },
    true,
    [ 'sign', 'verify' ]
  )
  return await window.crypto.subtle.exportKey('jwk', keyPair.privateKey)
}

export async function getOrderAuthorization(jwk, accountUrl, order) {
  if (!nonce) await getNewNonce()

  const header = {
    alg: "ES256",
    kid: accountUrl,
    nonce: nonce,
    url: order.authorizations[0]
  }
  const payload = ""

  const jwt = await jwtFromJson(jwk, header, payload)

  const res = await fetch(order.authorizations[0], {
    method: "POST", // A POST-AS-GET request
    headers: { "Content-Type": "application/jose+json" },
    body: JSON.stringify(parseJwt(jwt))
  })
  nonce = res.headers.get('Replay-Nonce');
  
  const authorization = await res.json()
  console.log("authorization:", authorization)
  return authorization
}


export async function postNewAccount(jwk, options={ onlyReturnExisting: false }) {
  // function base64Url(buf) {
  //   return buf.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  // }

  if (!nonce) await getNewNonce()

  const pubJwk = {
    "crv": jwk.crv,
    "kty": jwk.kty,
    "x": jwk.x,
    "y": jwk.y,
  }
  const header = {
    nonce: nonce,
    url: directory.newAccount,
    alg: 'ES256',
    jwk: pubJwk
  }
  const payload = {
    termsOfServiceAgreed: true,
    onlyReturnExisting: options.onlyReturnExisting
  }
  const jwt = await jwtFromJson(jwk, header, payload)

  const res = await fetch(directory.newAccount, {
    mode: "cors",
    method: "POST",
    headers: { "Content-Type": "application/jose+json" },
    body: JSON.stringify(parseJwt(jwt))
  })
  nonce = res.headers.get('Replay-Nonce');

  const accountUrl = res.headers.get('Location');

  console.log(await res.json())
  console.log("accountUrl: "+accountUrl)
  console.log("nonce: "+nonce)

  return accountUrl
}


export async function postNewOrder(jwk, domainName, accountUrl='') {
  console.log(jwk, domainName, accountUrl)
  if (!nonce) await getNewNonce()
  if (!accountUrl)
    accountUrl = await postNewAccount(jwk, { onlyReturnExisting: true })

  const header = {
    alg: "ES256",
    kid: accountUrl,
    nonce: nonce,
    url: directory.newOrder
  }
  const payload = {
    identifiers: [{ "type": "dns", "value": domainName }]
  }
  const jwt = await jwtFromJson(jwk, header, payload)
  
  let res = await fetch(directory.newOrder, {
    method: "POST",
    headers: { "Content-Type": "application/jose+json" },
    body: JSON.stringify(parseJwt(jwt))
  })
  nonce = res.headers.get('Replay-Nonce');
  
  const order = await res.json()
  console.log("order:", order)
  const challenge = (await getOrderAuthorization(jwk, accountUrl, order)).challenges.filter(c => c.type === "dns-01")[0]
  
  const keyAuthorization = challenge.token + '.' + (await thumbprint(jwk))
  const hash = await window.crypto.subtle.digest(
		{ name: "SHA-256", },
	  (new TextEncoder()).encode(keyAuthorization)
  )
  const txtRecord = arrayBufferToBase64Url(hash)
  console.log("recordName: "+'_acme-challenge.' + domainName)
  console.log("recordTxt: "+txtRecord)

  return {
    recordName: '_acme-challenge.' + domainName,
    recordTxt: txtRecord,
    order
  }
}


export async function postOrderChallenge(jwk, order) {
  if (!nonce) await getNewNonce()
  const accountUrl = await postNewAccount(jwk, { onlyReturnExisting: true })
  const challenge = (await getOrderAuthorization(jwk, accountUrl, order)).challenges.filter(c => c.type === "dns-01")[0]
  const header = {
    alg: 'ES256',
    kid: accountUrl,
    nonce: nonce,
    url: challenge.url
  }
  const payload = {}

  const jwt = await jwtFromJson(jwk, header, payload)
  
  let res = await fetch(challenge.url, {
    method: "POST",
    headers: { "Content-Type": "application/jose+json" },
    body: JSON.stringify(parseJwt(jwt))
  })
  nonce = res.headers.get('Replay-Nonce');
  console.log(await res.json())
}


export async function postOrderFinalize(jwk, order) {
  if (!nonce) await getNewNonce()
  const accountUrl = await postNewAccount(jwk, { onlyReturnExisting: true })
  const domainName = (await getOrderAuthorization(jwk, accountUrl, order)).identifier.value
  const header = {
    alg: "ES256",
    kid: accountUrl,
    nonce: nonce,
    url: order.finalize
  }
  const payload = {
    csr: generateCsr(domainName)
  }
  const jwt = await jwtFromJson(jwk, header, payload)
  
  const res = await fetch(order.finalize, {
    method: "POST",
    headers: { "Content-Type": "application/jose+json" },
    body: JSON.stringify(parseJwt(jwt))
  })
  nonce = res.headers.get('Replay-Nonce');
  const body = await res.json()
  console.log(body)
  return body.certificate
}

function generateCsr(domainName) {
  let keys = forge.pki.rsa.generateKeyPair(2048);
 
  let csr = forge.pki.createCertificationRequest();
  csr.publicKey = keys.publicKey;
  csr.setSubject([{
    name: 'commonName',
    value: domainName
  }]);
  csr.setAttributes([{
    name: 'extensionRequest',
    extensions: [{
      name: 'subjectAltName',
      altNames: [{
        // 2 is DNS type
        type: 2,
        value: domainName
      }]
    }]
  }])
  csr.sign(keys.privateKey, forge.md.sha256.create())
  const base64UrlDer = forge.pki.certificationRequestToPem(csr).split(/\r\n|\r|\n/)
    .slice(1, -2)
    .join('')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')
  // const der = forge.asn1.toDer(forge.pki.certificationRequestToAsn1(csr))
  // const base64UrlDer2 = arrayBufferToBase64Url(Buffer.from(der.toHex(), 'hex').buffer)
  return base64UrlDer
}

async function jwtFromJson(jwk, header, payload) {
  const privateKey = await window.crypto.subtle.importKey(
    'jwk', jwk, { name: "ECDSA", namedCurve: "P-256"}, false, ['sign']
  )
  const base64Header = jsonToBase64Url(header)
  const base64Payload = payload === '' ? "" : jsonToBase64Url(payload)
  const base64Signature = arrayBufferToBase64Url(await window.crypto.subtle.sign(
    { name: "ECDSA", hash: { name: "SHA-256" } },
    privateKey,
    (new TextEncoder()).encode(base64Header + '.' + base64Payload)
  ))

  return base64Header + '.' + base64Payload + '.' + base64Signature
}

function parseJwt(jwt) {
  const jwtParts = jwt.split('.')
  return {
    protected: jwtParts[0],
    payload: jwtParts[1],
    signature: jwtParts[2]
  }
}

function jsonToBase64Url(json) {
  return window.btoa(JSON.stringify(json))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')
}

function arrayBufferToBase64Url(buf) {
  return window.btoa(Array.prototype.map.call(
    new Uint8Array(buf),
    (ch) => String.fromCharCode(ch)
  ).join(''))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')
}
