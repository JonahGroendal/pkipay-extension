const initialState = {
  isOpen: false,
  counterparties: [],
  values: [],
  txHash: null,
  txError: null,
  txObject: null,
  txConfirmed: false
}

function transactionScreen(state=initialState, action) {
  switch (action.type) {
    case 'REVIEW_TX':
      return {
        ...initialState,
        isOpen: true,
        counterparties: action.meta.counterparties,
        values: action.meta.values,
        txObject: action.payload.txObject,
      };
    case 'SEND_TX_SUCCESS':
      return {
        ...state,
        txHash: action.payload.txHash
      };
    case 'SEND_TX_ERROR':
      return {
        ...state,
        txError: action.payload.txError
      };
    case 'CONFIRM_TX':
      return {
        ...state,
        txConfirmed: true
      };
    case 'CLOSE_TX':
      return {
        ...state,
        isOpen: false
      };
    case 'OPEN_TX':
      return {
        ...state,
        isOpen: true
      };
    case 'CANCEL_TX':
      return initialState;
    default:
      return state;
  }
}

export default transactionScreen
