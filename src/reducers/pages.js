const initState = { tabIndex: 0 }

function pages(state=initState, action) {
  switch (action.type) {
    case 'SET_TAB_INDEX':
      return { tabIndex: action.tabIndex }
    default:
      return state
  }
}

export default pages
