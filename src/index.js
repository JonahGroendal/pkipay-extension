// import 'typeface-roboto'

import React from 'react'
import ReactDOM from 'react-dom'
import { createStore, applyMiddleware } from 'redux'
import { Provider } from 'react-redux'
import thunkMiddleware from 'redux-thunk'
import loggerMiddleware from 'redux-logger'
import App from './containers/App.js'
import rootReducer from './reducers'
import { loadState, saveState } from './api/browser'
import { throttle, omit } from 'lodash'

loadState().then(persistedState => {
  const middlewares = []
  middlewares.push(thunkMiddleware)
  if (process.env.REACT_APP_ACTUAL_ENV !== 'production')
    middlewares.push(loggerMiddleware)
  const store = createStore(
    rootReducer,
    persistedState,
    applyMiddleware(...middlewares)
  );

  ReactDOM.render(
    <Provider store={store}>
      <App />
    </Provider>,
    document.getElementById('render-target')
  );

  store.subscribe(throttle(() => {
    saveState(omit(store.getState(), ['pages', 'unlockWalletScreen', 'objectHostname']));
  }, 3000));
})
