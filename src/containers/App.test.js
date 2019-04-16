import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { Provider } from 'react-redux';
import rootReducer from '../reducers';
import App from './App';


it('renders without crashing', () => {
  const div = document.createElement('div')
  const store = createStore(
    rootReducer,
    applyMiddleware(thunkMiddleware)
  )

  ReactDOM.render(
    <Provider store={store}>
      <App />
    </Provider>,
    div);
  ReactDOM.unmountComponentAtNode(div);
});
