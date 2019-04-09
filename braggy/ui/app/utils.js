import io from 'socket.io-client';
import { initFileBrowserRequest } from '../file-browser/file-browser-api';
import * as ImageViewAPI from '../imageview/imageview-api';
import * as AppAPI from './app-api';

import DownloadWorker from '../imageview/image-download.worker';
import DataWorker from '../imageview/image-data.worker';
import imageBuffer from './buffer';

export default function initApp(store) {
  const socket = io.connect(`http://${document.domain}:${window.location.port}`, { path: '/api/socket.io/' });

  store.dispatch(initFileBrowserRequest());

  socket.on('connect', () => (console.log('connect')));

  socket.on('show-image', (data) => {
    store.dispatch(ImageViewAPI.fetchImageRequest(data.path));
  });

  socket.on('set-follow', (data) => {
    store.dispatch(AppAPI.setFollow(
      data.follow,
      data.wavelength,
      data.detector_distance,
      data.detector_radius
    ));
  });

  socket.on('disconnect', () => (console.log('disconnect')));

  window.imgDownloadWorker = new DownloadWorker();
  window.imgDataWorker = new DataWorker();

  window.imgDownloadWorker.onmessage = function (e) {
    imageBuffer.add(e.data.path, 'raw', e.data.data);
  };

  window.imgDataWorker.onmessage = function (e) {
    store.dispatch(ImageViewAPI.fetchImageSuccess({ path: e.data.path, hdr: e.data.hdr }));
    imageBuffer.add(e.data.path, 'img', e.data.data);
  };
}
