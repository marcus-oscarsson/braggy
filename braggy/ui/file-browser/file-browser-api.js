import axios from 'axios';

// Actions
export const SET_CONTENT = 'file-browser/SET_CONTENT';
export const SET_LOADING = 'file-browser/SET_LOADING';
export const SET_SELECTED_FILE = 'file-browser/SET_SELECTED_FILE';
export const INIT = 'file-browser/INIT';
export const SET_RANGE = 'file-browser/SET_RANGE';

const API_URL = '/api/file-browser';

const initialState = {
  files: [],
  selectedFile: '',
  loading: false,
  pageSize: 10,
  currentRange: [0, 14]
};


// Reducer
export default (state = initialState, action) => {
  switch (action.type) {
    case SET_CONTENT:
      return {
        ...state,
        files: action.files
      };
    case SET_LOADING:
      return {
        ...state,
        loading: action.loading
      };
    case SET_SELECTED_FILE:
      return {
        ...state,
        selectedFile: action.path
      };
    case SET_RANGE: {
      let currentRange = [];

      if (action.op === 'inc') {
        currentRange = state.currentRange.map(val => val + state.pageSize);
      } else {
        currentRange = state.currentRange.map(val => val - state.pageSize);
      }

      return {
        ...state,
        currentRange
      };
    }
    case INIT:
      return {
        ...state,
        files: action.files
      };
    default:
      return state;
  }
};


// Action creators
export function listDirSuccess(data) {
  return (dispatch) => {
    dispatch({
      type: SET_CONTENT,
      files: data
    });
  };
}

export function initSuccess(data) {
  return (dispatch) => {
    dispatch({
      type: INIT,
      files: data
    });
  };
}


export function setLoading(loading) {
  return (dispatch) => {
    dispatch({
      type: SET_LOADING,
      loading
    });
  };
}


export function selectFile(path) {
  return (dispatch) => {
    dispatch({
      type: SET_SELECTED_FILE,
      path
    });
  };
}


export function setRange(op = 'inc') {
  return (dispatch) => {
    dispatch({
      type: SET_RANGE,
      op
    });
  };
}


// REST API
export function listDirRequest(path) {
  return (dispatch) => {
    dispatch(setLoading(true));
    axios.post(`${API_URL}/list-dir`, { path })
      .then((response) => {
        dispatch(listDirSuccess(response.data.items));
        dispatch(setLoading(false));
      })
      .catch((error) => {
        throw (error);
      })
      .catch(() => {
        dispatch(setLoading(false));
      });
  };
}

export function initFileBrowserRequest() {
  return (dispatch) => {
    dispatch(setLoading(true));
    axios.get(`${API_URL}/init`)
      .then((response) => {
        dispatch(initSuccess(response.data.items));
      })
      .catch((error) => {
        throw (error);
      })
      .then(() => {
        dispatch(setLoading(false));
      });
  };
}
