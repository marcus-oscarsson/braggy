import React from 'react';
import io from 'socket.io-client';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import store, { history } from './app/redux-store';
import Main from './app/Main';
import * as serviceWorker from './serviceWorker';

import { initFileBrowserRequest } from './file-browser/file-browser-api';
import * as ImageViewAPI from './imageview/imageview-api';
import Worker from './imageview/image-download.worker';


import './index.css';

const socket = io.connect(`http://${document.domain}:${window.location.port}`, { path: '/api/socket.io/' });

store.dispatch(initFileBrowserRequest());

socket.on('connect', () => (console.log('connect')));

socket.on('show-image', (data) => {
  store.dispatch(ImageViewAPI.fetchImageRequest(data.path));
});

socket.on('disconnect', () => (console.log('disconnect')));

const worker = new Worker();
window.imgWorker = worker;

worker.onmessage = function (e) {
  store.dispatch(ImageViewAPI.setRawData(e.data.path, e.data.data));
};

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
