import axios from 'axios';

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
    compress: true,
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
            data: action.data,
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
            data: action.data,
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
      path: data.path,
      data: data.data,
      width: data.width,
      height: data.height
    });
  };
}


export function setAndAddImage(data) {
  return (dispatch) => {
    dispatch({
      type: SET_AND_ADD_IMAGE,
      path: data.path,
      data: data.data,
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
  return (dispatch, getState) => {
    const { images, options } = getState().imageView;

    if (!(path in images)) {
      const p1 = axios.post(`${API_URL}/get-image`, { path, compress: options.compress }, { responseType: 'blob' })
        .then(response => ({ path, data: response.data }))
        .catch((error) => {
          throw (error);
        });

      const p2 = axios.post(`${API_URL}/get-image-header`, { path })
        .then(response => ({ path, data: response.data }))
        .catch((error) => {
          throw (error);
        });

      const result = Promise.all([p1, p2]);

      result.then((data) => {
        const img = new Image();

        img.onload = () => {
          dispatch(fetchImageSuccess({
            path: data[0].path,
            data: img,
            hdr: data[1].data
          }));
        };

        img.src = URL.createObjectURL(data[0].data);
      });
    } else {
      dispatch(setCurrentImage(path));
    }
  };
}
