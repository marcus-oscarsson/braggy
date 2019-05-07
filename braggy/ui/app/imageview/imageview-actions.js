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
    showFullData: false
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

export default handleActions(
  {
    [init]: () => ({ ...initialState }),
    [setAndAddImage]: (
      state,
      { payload: { path, hdr } }
    ) => (
      { ...state, images: { ...state.images, [path]: { hdr } }, currentImage: path }
    ),
    [addImage]: (
      state,
      { payload: { path, hdr } }
    ) => ({
      ...state, images: { ...state.images, [path]: { hdr } }
    }),
    [setCurrentImage]: (
      state,
      { payload: { path } }
    ) => ({ ...state, currentImage: path }),
  },
  initialState
);


// // Reducer
// export default (state = initialState, action) => {
//   switch (action.type) {
//     case INIT:
//       return {
//         ...initialState
//       };
//     case SET_AND_ADD_IMAGE:
//       return {
//         ...state,
//         images: {
//           ...state.images,
//           [action.path]: {
//             hdr: action.hdr
//           }
//         },
//         currentImage: action.path
//       };
//     case ADD_IMAGE:
//       return {
//         ...state,
//         images: {
//           ...state.images,
//           [action.path]: {
//             hdr: action.hdr
//           }
//         }
//       };
//     case SET_CURRENT_IMAGE:
//       return {
//         ...state,
//         currentImage: action.path
//       };
//     case SET_OPTION:
//       return {
//         ...state,
//         options: { ...state.options, [action.option]: action.value }
//       };
//     default:
//       return state;
//   }
// };

// REST API
export function fetchImageRequest(path) {
  return (dispatch, getState) => {
    const { follow } = getState().app;
    const { downloadFull } = getState().imageView.options;


    if (!(imageBuffer.has(path))) {
      axios.post(`${API_URL}/preload`, { path })
        .then((response) => {
          const hdr = response.data;

          axios.post('/api/imageview/raw-subs', { path }, { responseType: 'blob' })
            .then((resp) => {
              window.imgDataWorker.postMessage({ path, hdr, data: resp.data });
              if (!follow && downloadFull) {
                window.imgDownloadWorker.postMessage({ path });
              }
            });
        })
        .catch((error) => {
          throw (error);
        });
    } else {
      dispatch(setCurrentImage(path));
    }
  };
}
