export const addSubscription = subscription => ({
  type: 'ADD_SUBSCRIPTION',
  subscription
});

export const removeSubscription = hostname => ({
  type: 'REMOVE_SUBSCRIPTION',
  hostname
});

export const setCurrency = currency => ({
  type: 'SET_CURRENCY',
  currency
});

export const setPaymentSchedule = paymentSchedule => ({
  type: 'SET_PAYMENT_SCHEDULE',
  paymentSchedule
});

export const setThemeType = themeType => ({
  type: 'SET_THEME_TYPE',
  themeType
});

export const setNextPayment = nextPayment => ({
  type: 'SET_NEXT_PAYMENT',
  nextPayment
});
