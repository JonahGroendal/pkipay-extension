const initState = {
  recordName: '',
  recordText: '',
  jwk: null,
  order: null,
  certificates: []
}

function dnsChallenge(state=initState, action) {
    switch (action.type) {
      case 'UPDATE_DNS_CHALLENGE':
        return {
          recordName: action.payload.recordName,
          recordText: action.payload.recordText,
          jwk: action.payload.jwk,
          order: action.payload.order,
          certificates: state.certificates
        }
      case 'CANCEL_DNS_CHALLENGE':
        return {
          ...initState,
          certificates: state.certificates
        }
      case 'DNS_CHALLENGE_SUCCESS':
        state.certificates.push(action.payload.certificate)
        return {
          ...initState,
          certificates: state.certificates
        }
      default:
        return state
    }
  }
  
  export default dnsChallenge