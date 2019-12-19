const initState = {
  ongoing: false,
  domainName: '',
  recordName: '',
  recordText: '',
  jwk: null,
  order: null,
  pemCertChain: null,
  pkcs8Key: null
}

function dnsChallenge(state=initState, action) {
  switch (action.type) {
    case 'REQUEST_DNS_CHALLENGE':
      return {
        ...initState,
        ongoing: true,
        domainName: action.payload.domainName,
        recordName: action.payload.recordName,
        recordText: action.payload.recordText,
        jwk: action.payload.jwk,
        order: action.payload.order
      }
    case 'CANCEL_DNS_CHALLENGE':
      return {
        ...initState
      }
    case 'DNS_CHALLENGE_SUCCESS':
      return {
        ...state,
        pemCertChain: action.payload.pemCertChain,
        pkcs8Key: action.payload.pkcs8Key
      }
    case 'RESET_DNS_CHALLENGE':
      return {
        ...initState,
        ongoing: state.ongoing,
        domainName: state.domainName
      }
    case 'COMPLETE_DNS_CHALLENGE':
      return {
        ...initState,
        domainName: state.domainName
      }
    default:
      return state
  }
}

export default dnsChallenge
