import React from 'react'
import { connect } from 'react-redux'
import { updateDnsChallenge, submitDnsChallenge, cancelDnsChallenge } from '../actions'
import { uploadCertAndProveOwnership, registerAsDomainOwner, pointEnsNodeToTokenSaleResolver } from '../api/blockchain'
import PresentationalComponent from '../components/DnsChallengeScreen'

function DnsChallengeScreen({ open, onClose, onOpen, ...mapped }) {
  React.useEffect(() => {
    if (open) {
      if (!mapped.recordName)
        mapped.onChangeChallenge(mapped.objectHostname)
    } else {
      if (mapped.recordName) onOpen()
    }
  }, [open])

  async function handleSubmitChallenge() {
    const domainName = mapped.recordName.split('.').slice(1).join('.')
    const { certUrl, pkcs8Key } = await mapped.onSubmitChallenge()
    if (certUrl) {
      const certChain = await getCertChain(certUrl)
      await uploadCertAndProveOwnership(mapped.address, certChain, pkcs8Key)
      await registerAsDomainOwner(mapped.address, domainName)
      await pointEnsNodeToTokenSaleResolver(mapped.address, domainName)
    } else {
      mapped.onCancelChallenge()
    }
  }

  function handleClose() {
    mapped.onCancelChallenge()
    onClose()
  }

  return React.createElement(PresentationalComponent, {
    open,
    onClose: handleClose,
    onSubmitChallenge: handleSubmitChallenge,
    recordName: mapped.recordName,
    recordText: mapped.recordText
  })
}

const mapStateToProps = state => ({
  objectHostname: state.objectHostname,
  address: state.wallet.addresses[state.wallet.defaultAccount],
  recordName: state.dnsChallenge.recordName,
  recordText: state.dnsChallenge.recordText,
  jwk: state.dnsChallenge.jwk,
  order: state.dnsChallenge.order
})

const mapDispatchToProps = dispatch => ({
  onChangeChallenge: domainName => dispatch(updateDnsChallenge(domainName)),
  onSubmitChallenge: () => dispatch(submitDnsChallenge()),
  onCancelChallenge: () => dispatch(cancelDnsChallenge())
})

export default connect(mapStateToProps, mapDispatchToProps)(DnsChallengeScreen)

/**
 * @returns an array of PEM-encoded certificates starting at root
 */
async function getCertChain(certUrl) {
  const certs = await (await fetch(certUrl)).text()
  console.log(certs)
  let pemCertChain = []
  let startIndex = certs.indexOf('-----BEGIN CERTIFICATE-----')
  let endIndex
  while (startIndex !== -1) {
    endIndex = certs.indexOf('-----END CERTIFICATE-----', startIndex) + '-----END CERTIFICATE-----'.length
    pemCertChain.push(certs.slice(startIndex, endIndex))
    startIndex = certs.indexOf('-----BEGIN CERTIFICATE-----', endIndex)
  }
  pemCertChain.push(`
    -----BEGIN CERTIFICATE-----
    MIIFATCCAumgAwIBAgIRAKc9ZKBASymy5TLOEp57N98wDQYJKoZIhvcNAQELBQAw
    GjEYMBYGA1UEAwwPRmFrZSBMRSBSb290IFgxMB4XDTE2MDMyMzIyNTM0NloXDTM2
    MDMyMzIyNTM0NlowGjEYMBYGA1UEAwwPRmFrZSBMRSBSb290IFgxMIICIjANBgkq
    hkiG9w0BAQEFAAOCAg8AMIICCgKCAgEA+pYHvQw5iU3v2b3iNuYNKYgsWD6KU7aJ
    diddtZQxSWYzUI3U0I1UsRPTxnhTifs/M9NW4ZlV13ZfB7APwC8oqKOIiwo7IwlP
    xg0VKgyz+kT8RJfYr66PPIYP0fpTeu42LpMJ+CKo9sbpgVNDZN2z/qiXrRNX/VtG
    TkPV7a44fZ5bHHVruAxvDnylpQxJobtCBWlJSsbIRGFHMc2z88eUz9NmIOWUKGGj
    EmP76x8OfRHpIpuxRSCjn0+i9+hR2siIOpcMOGd+40uVJxbRRP5ZXnUFa2fF5FWd
    O0u0RPI8HON0ovhrwPJY+4eWKkQzyC611oLPYGQ4EbifRsTsCxUZqyUuStGyp8oa
    aoSKfF6X0+KzGgwwnrjRTUpIl19A92KR0Noo6h622OX+4sZiO/JQdkuX5w/HupK0
    A0M0WSMCvU6GOhjGotmh2VTEJwHHY4+TUk0iQYRtv1crONklyZoAQPD76hCrC8Cr
    IbgsZLfTMC8TWUoMbyUDgvgYkHKMoPm0VGVVuwpRKJxv7+2wXO+pivrrUl2Q9fPe
    Kk055nJLMV9yPUdig8othUKrRfSxli946AEV1eEOhxddfEwBE3Lt2xn0hhiIedbb
    Ftf/5kEWFZkXyUmMJK8Ra76Kus2ABueUVEcZ48hrRr1Hf1N9n59VbTUaXgeiZA50
    qXf2bymE6F8CAwEAAaNCMEAwDgYDVR0PAQH/BAQDAgEGMA8GA1UdEwEB/wQFMAMB
    Af8wHQYDVR0OBBYEFMEmdKSKRKDm+iAo2FwjmkWIGHngMA0GCSqGSIb3DQEBCwUA
    A4ICAQBCPw74M9X/Xx04K1VAES3ypgQYH5bf9FXVDrwhRFSVckria/7dMzoF5wln
    uq9NGsjkkkDg17AohcQdr8alH4LvPdxpKr3BjpvEcmbqF8xH+MbbeUEnmbSfLI8H
    sefuhXF9AF/9iYvpVNC8FmJ0OhiVv13VgMQw0CRKkbtjZBf8xaEhq/YqxWVsgOjm
    dm5CAQ2X0aX7502x8wYRgMnZhA5goC1zVWBVAi8yhhmlhhoDUfg17cXkmaJC5pDd
    oenZ9NVhW8eDb03MFCrWNvIh89DDeCGWuWfDltDq0n3owyL0IeSn7RfpSclpxVmV
    /53jkYjwIgxIG7Gsv0LKMbsf6QdBcTjhvfZyMIpBRkTe3zuHd2feKzY9lEkbRvRQ
    zbh4Ps5YBnG6CKJPTbe2hfi3nhnw/MyEmF3zb0hzvLWNrR9XW3ibb2oL3424XOwc
    VjrTSCLzO9Rv6s5wi03qoWvKAQQAElqTYRHhynJ3w6wuvKYF5zcZF3MDnrVGLbh1
    Q9ePRFBCiXOQ6wPLoUhrrbZ8LpFUFYDXHMtYM7P9sc9IAWoONXREJaO08zgFtMp4
    8iyIYUyQAbsvx8oD2M8kRvrIRSrRJSl6L957b4AFiLIQ/GgV2curs0jje7Edx34c
    idWw1VrejtwclobqNMVtG3EiPUIpJGpbMcJgbiLSmKkrvQtGng==
    -----END CERTIFICATE-----
  `)
  pemCertChain.reverse()
  return pemCertChain
}
