import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';

import store, { history } from 'app/redux-store';
import Main from 'views/main/Main';
import * as serviceWorker from 'serviceWorker';
import initApp from 'app/utils/utils';
import 'index.scss';
import 'bootstrap/dist/css/bootstrap.min.css';

initApp(store);

const target = document.querySelector('#root');

render(
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <Main />
    </ConnectedRouter>
  </Provider>,
  target
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
