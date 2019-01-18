const initialState = {
  isOpen: false,
  attempts: 0
}
const unlockWalletScreen = (state=initialState, action) => {
  switch (action.type) {
    case 'UNLOCK_WALLET_REQUEST':
      return {
        ...initialState,
        isOpen: true,
      };
    case 'UNLOCK_WALLET_FAILURE':
      return {
        ...state,
        attempts: state.attempts + 1,
      };
    case 'UNLOCK_WALLET_SUCCESS':
      return initialState;
    case 'UNLOCK_WALLET_CANCEL':
      return initialState;
    default:
      return state;
  }
}

export default unlockWalletScreen
