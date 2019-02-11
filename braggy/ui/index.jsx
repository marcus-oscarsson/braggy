import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { ConnectedRouter } from 'connected-react-router';
import store, { history, persistor } from './app/redux-store';
import App from './app/main-widget';
import * as serviceWorker from './serviceWorker';

import { initFileBrowserRequest } from './file-browser/file-browser-api';

import './index.css';

store.dispatch(initFileBrowserRequest());

const target = document.querySelector('#root');

render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <ConnectedRouter history={history}>
        <App />
      </ConnectedRouter>
    </PersistGate>
  </Provider>,
  target
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();