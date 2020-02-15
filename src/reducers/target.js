const target = (state = '', action) => {
  switch (action.type) {
    case 'SET_TARGET':
      return action.target;
    default:
      return state;
  }
}

export default target
