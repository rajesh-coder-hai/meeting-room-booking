import { combineReducers } from "redux";
import sharedReducer from "./sharedSlice";
import cartReducer from "./cartSlice";

const rootReducer = combineReducers({
  shared: sharedReducer,
  cart: cartReducer,
});

export default rootReducer;
