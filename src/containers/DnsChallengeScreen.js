import React from 'react'
import { connect } from 'react-redux'
import { requestDnsChallenge, submitDnsChallenge, cancelDnsChallenge, unlockWalletRequest, resetDnsChallenge, completeDnsChallenge } from '../actions'
import { uploadCertAndProveOwnership, registerAsDomainOwner, pointEnsNodeToTokenSaleResolver } from '../api/blockchain'
import { navigateTo } from '../api/browser'
import { decrypt } from '../api/symmetricCrypto'
import PresentationalComponent from '../components/DnsChallengeScreen'

function DnsChallengeScreen({ open, onClose, onOpen, ...mapped }) {
  const domainName = mapped.ongoing ? mapped.domainName : mapped.objectHostname

  React.useEffect(() => {
    if (mapped.ongoing)
      onOpen(); // Open self
  }, []);

  function handleClose() {
    mapped.onCancelChallenge();
    onClose();
  }

  function handleReset() {
    mapped.onResetChallenge();
  }

  async function handleStepComplete(stepIndex) {
    let password = await mapped.onUnlockWalletRequest()
    switch (stepIndex) {
      case 0:
        await mapped.onRequestChallenge(password, domainName);
        break;
      case 1:
        await mapped.onSubmitChallenge(password)
        break;
      case 2:
        const certChain = await getCertChain(mapped.certUrl);
        await uploadCertAndProveOwnership(mapped.address, certChain, await decrypt(mapped.pkcs8Key, password));
        await registerAsDomainOwner(mapped.address, domainName);
        await pointEnsNodeToTokenSaleResolver(mapped.address, domainName);
        await mapped.onCompleteChallenge();
        break;
      default:
        break;
    }
  }

  async function handleClickLink(href) {
    try {
      await navigateTo(href);
    } catch (error) {
      console.error(error);
    }
  }

  function handleCopy(text) {
    navigator.clipboard.writeText(text)
  }

  function getInitStepIndex() {
    if (mapped.certUrl)
      return 2;
    if (mapped.recordText)
      return 1;
    return 0;
  }

  return React.createElement(PresentationalComponent, {
    open,
    onClose: handleClose,
    onStepComplete: handleStepComplete,
    onClickLink: handleClickLink,
    onCopy: handleCopy,
    recordName: mapped.recordName,
    recordText: mapped.recordText,
    domainName: domainName,
    onReset: handleReset,
    initStepIndex: getInitStepIndex()
  })
}

const mapStateToProps = state => ({
  objectHostname: state.objectHostname,
  address: state.wallet.addresses[state.wallet.defaultAccount],
  recordName: state.dnsChallenge.recordName,
  recordText: state.dnsChallenge.recordText,
  domainName: state.dnsChallenge.domainName,
  certUrl: state.dnsChallenge.certUrl,
  pkcs8Key: state.dnsChallenge.pkcs8Key,
  ongoing: state.dnsChallenge.ongoing
})

const mapDispatchToProps = dispatch => ({
  onRequestChallenge: (password, domainName) => dispatch(requestDnsChallenge(password, domainName)),
  onSubmitChallenge: (password) => dispatch(submitDnsChallenge(password)),
  onCancelChallenge: () => dispatch(cancelDnsChallenge()),
  onResetChallenge: () => dispatch(resetDnsChallenge()),
  onCompleteChallenge: () => dispatch(completeDnsChallenge()),
  onUnlockWalletRequest: () => dispatch(unlockWalletRequest())
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
  // Temporary hardcoded hack. LetsEncrypt's ACME server's staging environment acts differently
  // than their production environment. Hopefully this will change when their
  // root is no longer cross-signed (On July 8, 2020).
  // Also, because the root cert is cross signed, production is broken until
  // July 8, 2020 when the new root cert comes out
  if (process.env.REACT_APP_ACTUAL_ENV === 'development' || process.env.REACT_APP_ACTUAL_ENV === 'test') {
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
  }
  pemCertChain.reverse()
  return pemCertChain
}
