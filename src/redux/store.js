import { createStore, applyMiddleware, compose } from "redux";
import createDebounce from "redux-debounced";
import thunk from "redux-thunk";
import rootReducer from "./rootReducer";
import logger from 'redux-logger';

const middlewares = [logger,thunk, createDebounce()];

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(
   rootReducer,
   {},
   composeEnhancers(applyMiddleware(...middlewares))
);
//console.log('store',store.getState());

export { store };