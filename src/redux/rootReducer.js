// import external modules
import { combineReducers } from "redux";
// import internal(own) modules
import todoReducer from "./todo/";
import customizer from "./customizer/";
import { reducer as toastrReducer } from "react-redux-toastr";

const rootReducer = combineReducers({
  //todoApp: todoReducer,
  toastr: toastrReducer,
  customizer: customizer
});

export default rootReducer;
