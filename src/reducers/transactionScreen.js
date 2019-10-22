const initialState = {
  isOpen: false,
  counterparties: [],
  values: [],
  txHashes: null,
  txError: null,
  txObjects: null,
  txConfirmed: false,
  txReverted: false
}

function transactionScreen(state=initialState, action) {
  switch (action.type) {
    case 'REVIEW_TX':
      return {
        ...initialState,
        isOpen: true,
        counterparties: action.meta.counterparties,
        values: action.meta.values,
        txObjects: action.payload.txObjects,
      };
    case 'SEND_TX_SUCCESS':
      return {
        ...state,
        txHashes: action.payload.txHashes
      };
    case 'SEND_TX_ERROR':
      return {
        ...state,
        txError: action.payload.txError
      };
    case 'TX_CONFIRMED':
      return {
        ...state,
        txConfirmed: true
      };
    case 'TX_REVERTED':
      return {
        ...state,
        txReverted: true
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
