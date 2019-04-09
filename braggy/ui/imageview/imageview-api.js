import axios from 'axios';

import imageBuffer from '../app/buffer';

// Actions
export const INIT = 'imageview/INIT';
export const ADD_IMAGE = 'imageview/ADD_IMAGE';
export const SET_CURRENT_IMAGE = 'imageview/SET_CURRENT_IMAGE';
export const SET_AND_ADD_IMAGE = 'imageview/SET_AND_ADD_IMAGE';
export const SET_OPTION = 'imageview/SET_OPTION';

const API_URL = '/api/imageview';

const initialState = {
  images: {},
  currentImage: '',
  imageScale: 1,
  options: {
    showResolution: true,
    autoScale: true,
    aggDownload: true
  }
};


// Reducer
export default (state = initialState, action) => {
  switch (action.type) {
    case INIT:
      return {
        ...initialState
      };
    case SET_AND_ADD_IMAGE:
      return {
        ...state,
        images: {
          ...state.images,
          [action.path]: {
            hdr: action.hdr
          }
        },
        currentImage: action.path
      };
    case ADD_IMAGE:
      return {
        ...state,
        images: {
          ...state.images,
          [action.path]: {
            hdr: action.hdr
          }
        }
      };
    case SET_CURRENT_IMAGE:
      return {
        ...state,
        currentImage: action.path
      };
    case SET_OPTION:
      return {
        ...state,
        options: { ...state.options, [action.option]: action.value }
      };
    default:
      return state;
  }
};


// Action creators
export function addImage(data) {
  return (dispatch) => {
    dispatch({
      type: ADD_IMAGE,
      path: data.path
    });
  };
}


export function setAndAddImage(data) {
  return (dispatch) => {
    dispatch({
      type: SET_AND_ADD_IMAGE,
      path: data.path,
      hdr: data.hdr
    });
  };
}

export function setOption(option, value) {
  return (dispatch) => {
    dispatch({
      type: SET_OPTION,
      option,
      value
    });
  };
}


export function setCurrentImage(path) {
  return (dispatch) => {
    dispatch({
      type: SET_CURRENT_IMAGE,
      path
    });
  };
}


export function fetchImageSuccess(data) {
  return (dispatch) => {
    dispatch(setAndAddImage(data));
  };
}


// REST API
export function fetchImageRequest(path) {
  return (dispatch) => {
    // const { images } = getState().imageView;

    if (!(imageBuffer.has(path))) {
      axios.post(`${API_URL}/preload`, { path })
        .then((response) => {
          const hdr = response.data;

          axios.post('/api/imageview/image-raw', { path }, { responseType: 'blob' })
            .then((resp) => {
              window.imgDataWorker.postMessage({ path, hdr, data: resp.data });
              window.imgDownloadWorker.postMessage({ path });
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
