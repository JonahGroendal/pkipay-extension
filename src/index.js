import 'typeface-roboto'

import React from 'react'
import ReactDOM from 'react-dom'
import { createStore, applyMiddleware } from 'redux'
import { Provider } from 'react-redux'
import thunkMiddleware from 'redux-thunk'
import loggerMiddleware from 'redux-logger'
import App from './containers/App.js'
import rootReducer from './reducers'
import { loadState, saveState } from './api/browser'
import registerServiceWorker from './registerServiceWorker'
import { throttle, omit } from 'lodash'

loadState().then(persistedState => {
  const store = createStore(
    rootReducer,
    persistedState,
    applyMiddleware(
      thunkMiddleware,
      loggerMiddleware
    )
  );

  ReactDOM.render(
    <Provider store={store}>
      <App />
    </Provider>,
    document.getElementById('render-target')
  );
  registerServiceWorker();

  store.subscribe(throttle(() => {
    saveState(omit(store.getState(),['pages']));
  }, 3000));

  // if (store.state.nextPayment <= Date.now())
  //   const timestamps = Object.keys(store.state.schuledTxs).sort((a, b) => a - b)
  //   timestamps.forEach(timestamp => {
  //
  //   })
  //   store.dispatch(sendSignedTx( ))
})
