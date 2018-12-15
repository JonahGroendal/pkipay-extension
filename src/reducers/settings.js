const initialState = {
  currency: "USD",
  paymentSchedule: 'firstOfTheMonth',
  themeType: 'light',
};

const settings = (state=initialState, action) => {
  switch (action.type) {
    case 'SET_CURRENCY':
      return {
        ...state,
        currency: action.currency
      };
    case 'SET_PAYMENT_SCHEDULE':
      return {
        ...state,
        paymentSchedule: action.paymentSchedule
      };
    case 'SET_THEME_TYPE':
      return {
        ...state,
        themeType: action.themeType
      };
    default:
      return state;
  }
};

export default settings;
