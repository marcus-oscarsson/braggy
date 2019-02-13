import axios from 'axios';

// Actions
export const INIT = 'imageview/INIT';
export const ADD_IMAGE = 'imageview/ADD_IMAGE';
export const SET_CURRENT_IMAGE = 'imageview/SET_CURRENT_IMAGE';
export const SET_AND_ADD_IMAGE = 'imageview/SET_AND_ADD_IMAGE';
export const SET_OPTION = 'imageview/SET_OPTION';
export const SET_RAW_DATA = 'imageview/SET_RAW_DATA';

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
            hdr: action.hdr,
            raw: null
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
            hdr: action.hdr,
            raw: null
          }
        }
      };
    case SET_RAW_DATA:
      return {
        ...state,
        images: {
          ...state.images,
          [action.path]: {
            ...state.images[action.path],
            raw: action.data
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

export function setRawData(path, data) {
  return (dispatch) => {
    dispatch({
      type: SET_RAW_DATA,
      path,
      data
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
    const { images } = getState().imageView;

    if (!(path in images)) {
      axios.post(`${API_URL}/preload`, { path })
        .then((response) => {
          const img = `${API_URL}/image?path=${window.encodeURIComponent(path)}`;
          dispatch(fetchImageSuccess({ path, data: img, hdr: response.data }));
        })
        .then(() => {
          axios.post(`${API_URL}/raw`, { path }, { responseType: 'blob' })
            .then((response) => {
              let data = null;

              const fileReader = new FileReader();

              fileReader.onload = (event) => {
                data = new Int32Array(event.target.result);
                dispatch(setRawData(path, data));
                return data;
              };

              fileReader.readAsArrayBuffer(response.data);
            })
            .catch((error) => {
              throw (error);
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
