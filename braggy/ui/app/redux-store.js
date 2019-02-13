/* eslint-disable no-underscore-dangle */

import { createStore, applyMiddleware, compose } from 'redux';
import { routerMiddleware } from 'connected-react-router';
import logger from 'redux-logger';
import thunk from 'redux-thunk';
import createHistory from 'history/createBrowserHistory';
import createRootReducer from './root-reducer';

export const history = createHistory();

const initialState = {};
const enhancers = [];

// Logger MUST BE the last middleware
const middleware = [
  thunk,
  routerMiddleware(history),
  logger
];

if (process.env.NODE_ENV === 'development') {
  const devToolsExtension = window.__REDUX_DEVTOOLS_EXTENSION__;

  if (typeof devToolsExtension === 'function') {
    enhancers.push(devToolsExtension());
  }
}

const composedEnhancers = compose(
  applyMiddleware(...middleware),
  ...enhancers
);


const store = createStore(
  createRootReducer(history),
  initialState,
  composedEnhancers
);

export default store;
