const initialState = {
  "Currency": "USD",
  "Payment schedule": "First of the month",
  "Dark mode": false,
};

const settings = (state=initialState, action) => {
  switch (action.type) {
    case 'CHANGE_SETTING':
      return {
        ...state,
        [action.payload.name]: action.payload.value
      }
    default:
      return state;
  }
};

export default settings;
