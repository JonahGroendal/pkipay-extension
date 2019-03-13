const initialState = {
  addresses: [],
  tokens: [],
  keystores: [],
}

function wallet(state=initialState, action) {
  switch (action.type) {
    case 'CREATE_WALLET':
      return {
        ...state,
        addresses: action.payload.addresses,
        keystores: action.payload.keystores
      };
    case 'ADD_ACCOUNT':
      return {
        ...state,
        addresses: [action.payload.address, ...state.addresses],
        keystores: action.payload.keystores
      };
    case 'DELETE_WALLET':
      return initialState;
    default:
      return state
  }
}

export default wallet
