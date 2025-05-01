import { configureStore } from "@reduxjs/toolkit";
import sharedReducer from "./slices/sharedSlice";
import rootReducer from "./slices/rootReducer";

const store = configureStore({
  reducer: rootReducer,
});

export default store;
