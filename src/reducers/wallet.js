const initialState = {
  addresses: [],
  tokens: [],
  keystore: [],
  defaultAccount: -1
}

function wallet(state=initialState, action) {
  switch (action.type) {
    case 'CREATE_WALLET':
      return {
        ...state,
        addresses: action.payload.addresses,
        keystore: action.payload.keystore,
        defaultAccount: 0
      };
    case 'DELETE_WALLET':
      return initialState;
    case 'ADD_ACCOUNT':
      return {
        ...state,
        addresses: [...state.addresses, action.payload.address],
        keystore: action.payload.keystore,
        defaultAccount: state.addresses.length
      };
    case 'SET_DEFAULT_ACCOUNT':
      return {
        ...state,
        defaultAccount: action.payload.defaultAccount
      }
    case 'ADD_TOKEN':
      if (state.tokens.includes(action.payload.token))
        return { ...state }
      else
        return {
          ...state,
          tokens: [...state.tokens, action.payload.token]
        }
    case 'REMOVE_TOKEN':
      return {
        ...state,
        tokens: state.tokens.filter(token => token !== action.payload.token)
      }
    default:
      return state
  }
}

export default wallet
