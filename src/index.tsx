import ReactDOM from 'react-dom';

import appReducer from './app/app.slice';
import orderbookReducer from './features/orderbook/orderbook.slice';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { Provider, TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { App } from './app';

const rootReducer = combineReducers({
  site: appReducer,
  orderbook: orderbookReducer,
});

const store = configureStore({
  reducer: rootReducer,
});

export type AppState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<AppState> = useSelector;

const site = (
  <Provider store={store}>
    <App />
  </Provider>
);

ReactDOM.render(site, document.getElementById('root'));
