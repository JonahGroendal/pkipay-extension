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
    case 'ADD_TOKEN':
      if (state.tokens.indexOf(action.payload.name) !== -1)
        return state;
      return {
        ...state,
        tokens: [...state.tokens, action.payload.name]
      }
    case 'REMOVE_TOKEN':
      return {
        ...state,
        tokens: state.tokens.filter(name => name !== action.payload.name)
      }
    default:
      return state
  }
}

export default wallet
