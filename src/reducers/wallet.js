const initialState = {
  addresses: [],
  tokens: [],
  counterparties: [],
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
      if (state.tokens.includes(action.payload.address))
        return { ...state }
      else
        return {
          ...state,
          tokens: [...state.tokens, action.payload.address]
        }
    case 'REMOVE_TOKEN':
      return {
        ...state,
        tokens: state.tokens.filter(address => address !== action.payload.address)
      }
    case 'ADD_COUNTERPARTY':
      if (state.counterparties.includes(action.payload.address))
        return { ...state }
      else
        return {
          ...state,
          counterparties: [...state.counterparties, action.payload.address]
        }
    case 'REMOVE_COUNTERPARTY':
      return {
        ...state,
        counterparties: state.counterparties.filter(address => address !== action.payload.address)
      }
    default:
      return state
  }
}

export default wallet
