import strings from '../api/strings'

const nextMonth = new Date((new Date(Date.now())).getFullYear(), (new Date(Date.now())).getMonth() + 1)
const initialState = strings.paymentSchedule.firstOfTheMonth(nextMonth)

const nextPayment = (state=initialState, action) => {
  switch (action.type) {
    case 'SET_NEXT_PAYMENT':
      return action.nextPayment;
    default:
      return state;
  }
}

export default nextPayment;
