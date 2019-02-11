import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import counter from '../counter/actions';
import fileBrowser from '../file-browser/file-browser-api';
import imageView from '../imageview/imageview-api';

export default function createRootReducer(history) {
  return combineReducers({
    router: connectRouter(history),
    counter,
    fileBrowser,
    imageView
  });
}