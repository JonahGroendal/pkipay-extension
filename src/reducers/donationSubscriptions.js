const initialState = [];

const donationSubscriptions = (state=initialState, action) => {
  switch (action.type) {
    case 'ADD_DONATION_SUBSCRIPTION':
      return [
        ...state,
        {
          address: action.payload.address,
          amount: action.payload.amount,
          tokenAddr: action.payload.tokenAddr
        }
      ];
    case 'REMOVE_DONATION_SUBSCRIPTION':
      return state.filter(sub => sub.address !== action.payload.address || sub.tokenAddr !== action.payload.tokenAddr);
    default:
      return state;
  }
}

export default donationSubscriptions;
