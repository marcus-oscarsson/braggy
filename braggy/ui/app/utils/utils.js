import io from 'socket.io-client';

import { initFileBrowserRequest } from 'app/file-browser/file-browser-actions';
import * as ImageViewActions from 'app/imageview/imageview-actions';
import * as AppActions from 'app/app-actions';
import DownloadWorker from 'app/imageview/image-download.worker';
import DataWorker from 'app/imageview/image-data.worker';
import imageBuffer from 'app/utils/buffer';

export default function initApp(store) {
  const socket = io.connect(`http://${document.domain}:${window.location.port}`, { path: '/api/socket.io/' });

  store.dispatch(initFileBrowserRequest());

  socket.on('connect', () => (console.log('connect')));

  socket.on('show-image', (data) => {
    store.dispatch(ImageViewActions.fetchImageRequest(data.path));
  });

  socket.on('set-follow', (data) => {
    store.dispatch(AppActions.setFollow(
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
    imageBuffer.add(e.data.path, 'rgbdata', e.data.rgbdata);
  };

  window.imgDataWorker.onmessage = function (e) {
    store.dispatch(ImageViewActions.setAndAddImage(e.data.path, e.data.hdr));
    imageBuffer.add(e.data.path, 'img', e.data.data);
  };
}
