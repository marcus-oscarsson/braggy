/* eslint-disable no-underscore-dangle */

import { createStore, applyMiddleware, compose } from 'redux';
import { routerMiddleware } from 'connected-react-router';
import { persistStore, persistReducer } from 'redux-persist';
// defaults to localStorage for web and AsyncStorage for react-native
import storage from 'redux-persist/lib/storage';
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';
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

const persistConfig = {
  key: 'root',
  storage,
  stateReconciler: autoMergeLevel2
};

const store = createStore(
  persistReducer(persistConfig, createRootReducer(history)),
  initialState,
  composedEnhancers
);

export const persistor = persistStore(store);

export default store;
