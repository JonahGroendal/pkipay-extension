const initialState = {
  addresses: [],
  // old - not going into 1.0: tokens: [],
  addedTokens: [],
  counterparties: [],
  keystore: [],
  defaultAccount: -1,
  tokenScanComplete: false
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
    // old - not going into 1.0
    // case 'ADD_TOKEN':
    //   if (state.tokens.includes(action.payload.address))
    //     return { ...state }
    //   else
    //     return {
    //       ...state,
    //       tokens: [...state.tokens, action.payload.address]
    //     }
    // case 'REMOVE_TOKEN':
    //   return {
    //     ...state,
    //     tokens: state.tokens.filter(address => address !== action.payload.address)
    //   }
    case 'ADD_TOKEN':
      return {
        ...state,
        addedTokens: [
          ...state.addedTokens,
          {
            name: action.payload.name,
            symbol: action.payload.symbol,
            address: action.payload.address
          }
        ]
      }
    case 'REMOVE_TOKEN':
      return {
        ...state,
        addedTokens: state.addedTokens.filter(token => token.address !== action.payload.address)
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
    case 'TOKEN_SCAN_COMPLETE':
      return {
        ...state,
        tokenScanComplete: true
      }
    default:
      return state
  }
}

export default wallet
