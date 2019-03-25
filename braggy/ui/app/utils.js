import io from 'socket.io-client';
import { initFileBrowserRequest } from '../file-browser/file-browser-api';
import * as ImageViewAPI from '../imageview/imageview-api';

import Worker from '../imageview/image-download.worker';
import imageBuffer from './buffer';

export default function initApp(store) {
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
    imageBuffer.add(e.data.path, 'raw', e.data.data);
  };
}
