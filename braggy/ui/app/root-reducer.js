import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import fileBrowser from 'app/file-browser/file-browser-actions';
import imageView from 'app/imageview/imageview-actions';
import app from 'app/app-actions';


export default function createRootReducer(history) {
  return combineReducers({
    router: connectRouter(history),
    app,
    fileBrowser,
    imageView
  });
}
