const objectHostname = (state = '', action) => {
  switch (action.type) {
    case 'SET_OBJECT_HOSTNAME':
      return action.hostname;
    default:
      return state;
  }
}

export default objectHostname
