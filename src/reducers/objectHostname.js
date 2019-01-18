const objectHostname = (state = null, action) => {
  switch (action.type) {
    case 'SET_OBJECT_HOSTNAME':
      return action.objectHostname;
    default:
      return state;
  }
}

export default objectHostname
