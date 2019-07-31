function scheduledTXs(state={}, action) {
  switch (action.type) {
    case 'SCHEDULE_TX':
      return {
        ...state,
        [action.payload.id]: {
          txs: action.payload.txs,
          when: action.payload.when
        }
      };
    case 'UNSCHEDULE_TX':
      let newState = { ...state }
      delete newState[action.payload.id];
      return newState;
    default:
      return state;
  }
}

export default scheduledTXs
