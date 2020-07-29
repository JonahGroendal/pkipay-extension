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
    case 'DELETE_OLD_SCHEDULED_TXS':
      const now = Date.now()
      let newState2 = {}
      Object.keys(state).forEach(id => {
        if (state[id].when > now) {
          newState2[id] = state[id]
        }
      })
      return newState2
    default:
      return state;
  }
}

export default scheduledTXs
