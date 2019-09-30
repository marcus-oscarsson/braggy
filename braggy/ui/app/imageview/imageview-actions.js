import { createActions, handleActions } from 'redux-actions';
import axios from 'axios';

import imageBuffer from 'app/utils/buffer';

const API_URL = '/api/imageview';

const initialState = {
  images: {},
  currentImage: '',
  imageScale: 1,
  options: {
    showResolution: true,
    autoScale: true,
    aggDownload: true,
    downloadFull: true,
    showFullData: false,
    valueRange: [-2, 10],
    valueRangeLimit: [-2, 10, 5],
    availableCmaps: {
      viridis: 0,
      plasma: 1,
      magma: 2,
      inferno: 3,
      temperature: 4,
      grey: 5,
      deadpixels: 6,
    },
    currentCmap: 'viridis'
  }
};

export const {
  init,
  setAndAddImage,
  addImage,
  setCurrentImage,
  setOption,
} = createActions({
  INIT: () => ({ ...initialState }),
  SET_AND_ADD_IMAGE: (path, hdr) => ({ path, hdr }),
  ADD_IMAGE: (path, hdr) => ({ path, hdr }),
  SET_CURRENT_IMAGE: path => ({ path }),
  SET_OPTION: (key, value) => ({ key, value }),
}, { prefix: 'imageview' });

export const ImageViewReducer = {
  [init]: () => (
    { ...initialState }
  ),

  [setAndAddImage]: (state, { payload: { path, hdr } }) => (
    { ...state, images: { ...state.images, [path]: { hdr } }, currentImage: path }
  ),

  [addImage]: (state, { payload: { path, hdr } }) => (
    { ...state, images: { ...state.images, [path]: { hdr } } }
  ),

  [setCurrentImage]: (state, { payload: { path } }) => (
    { ...state, currentImage: path }
  ),

  [setOption]: (state, { payload: { key, value } }) => (
    { ...state, options: { ...state.options, [key]: value } }
  )
};

export default handleActions(
  ImageViewReducer,
  initialState
);

// REST API
export function fetchImageRequest(path) {
  return (dispatch, getState) => {
    const { follow } = getState().app;
    const { downloadFull } = getState().imageView.options;

    axios.post(`${API_URL}/preload`, { path })
      .then((response) => {
        const hdr = response.data;
        imageBuffer.add(path, 'hdr', hdr.braggy_hdr);
        window.previewDataDownloadWorker.postMessage({ path, hdr });

        if (!follow && downloadFull) {
          window.fullDataDownloadWorker.postMessage({ path });
        }
      })
      .catch((error) => {
        throw (error);
      });
  };
}
