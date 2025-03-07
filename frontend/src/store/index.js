import { configureStore } from '@reduxjs/toolkit';
import sharedReducer from './slices/sharedSlice';

const store = configureStore({
  reducer: {
    shared: sharedReducer
  }
});

export default store;
