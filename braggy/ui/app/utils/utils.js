import io from 'socket.io-client';

import { initFileBrowserRequest } from 'app/file-browser/file-browser-actions';
import * as ImageViewActions from 'app/imageview/imageview-actions';
import * as AppActions from 'app/app-actions';
import DownloadWorker from 'app/imageview/full-data-download.worker';
import DataWorker from 'app/imageview/preview-data-download.worker';
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

  window.fullDataDownloadWorker = new DownloadWorker();
  window.previewDataDownloadWorker = new DataWorker();

  window.fullDataDownloadWorker.onmessage = function (e) {
    const { follow } = store.getState().app;
    const { downloadFull } = store.getState().imageView.options;

    if (!follow && downloadFull) {
      const { hdr } = imageBuffer.get(e.data.path);
      const rawData = e.data.data;
      const rgbData = e.data.rgbdata;


      imageBuffer.add(e.data.path, 'raw', rawData);
      imageBuffer.add(e.data.path, 'rgbdata', rgbData);

      store.dispatch(ImageViewActions.setAndAddImage(e.data.path, hdr));
      window.twoDImageView.render(rgbData, rawData, hdr);
    }
  };

  window.previewDataDownloadWorker.onmessage = function (e) {
    const { follow } = store.getState().app;
    const { downloadFull } = store.getState().imageView.options;

    if (follow || !downloadFull) {
      const { hdr } = imageBuffer.get(e.data.path);
      const rgbData = e.data.data;

      imageBuffer.add(e.data.path, 'img', rgbData);

      store.dispatch(ImageViewActions.setAndAddImage(e.data.path, hdr));
      window.twoDImageView.render(rgbData, rgbData, hdr);
    }
  };
}
