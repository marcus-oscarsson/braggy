import { createActions, handleActions } from 'redux-actions';
import axios from 'axios';

const API_URL = '/api/file-browser';

const initialState = {
  files: [],
  selectedFile: '',
  loading: false,
  pageSize: 10,
  currentRange: [0, 14]
};

export const {
  setContent,
  setLoading,
  setSelectedFile,
} = createActions({
  SET_CONTENT: files => ({ files }),
  SET_LOADING: loading => ({ loading }),
  SET_SELECTED_FILE: path => ({ path }),
  SET_RANGE: (op = 'inc') => ({ op }),
}, { prefix: 'filebrowser' });

export default handleActions(
  {
    [setContent]: (
      state,
      { payload: { files } }
    ) => ({ ...state, files }),
    [setLoading]: (
      state,
      { payload: { loading } }
    ) => ({ ...state, loading }),
    [setSelectedFile]: (
      state,
      { payload: { path } }
    ) => ({ ...state, selectedFile: path }),
  },
  initialState
);

// REST API
export function listDirRequest(path) {
  return (dispatch) => {
    dispatch(setLoading(true));
    axios.post(`${API_URL}/list-dir`, { path })
      .then((response) => {
        dispatch(setContent(response.data.items));
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
        dispatch(setContent(response.data.items));
      })
      .catch((error) => {
        throw (error);
      })
      .then(() => {
        dispatch(setLoading(false));
      });
  };
}
