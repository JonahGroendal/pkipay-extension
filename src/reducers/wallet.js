const initialState = {
  addresses: [],
  tokens: [],
  keystore: [],
}

function wallet(state=initialState, action) {
  switch (action.type) {
    case 'CREATE_WALLET':
      return {
        ...state,
        addresses: action.payload.addresses,
        keystore: action.payload.keystore
      };
    case 'ADD_ACCOUNT':
      return {
        ...state,
        addresses: [action.payload.address, ...state.addresses],
        keystore: action.payload.keystore
      };
    case 'DELETE_WALLET':
      return initialState;
    default:
      return state
  }
}

export default wallet
