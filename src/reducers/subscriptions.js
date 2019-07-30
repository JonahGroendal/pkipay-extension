const initialState = [
  // Permanent subscription
  // `amount` is denominated in USD
  // gratiis#mostViewedSites must be at index 0
  //{hostname: "gratiis#mostViewedSites", amount: 0, name: "Most Viewed Sites", permanent: true },
];

const subscriptions = (state = initialState, action) => {
  switch (action.type) {
    case 'ADD_SUBSCRIPTION':
      return [
        ...state,
        {
          domainName: action.payload.domainName,
          amount: action.payload.amount
        }
      ];
    case 'REMOVE_SUBSCRIPTION':
      return state.filter(sub => sub.domainName !== action.payload.domainName || sub.permanent);
    default:
      return state;
  }
}

export default subscriptions;
