import { combineReducers } from 'redux';
import sharedReducer from './sharedSlice';

const rootReducer = combineReducers({
  shared: sharedReducer
});

export default rootReducer;
