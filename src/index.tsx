import ReactDOM from 'react-dom';
import './index.css';
import orderBook from './features/orders/orders.slice';
import siteReducer from './features/site/site.slice';

import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { Provider, TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import Site from './features/site/site.feature';
import Orderbook from './features/orders/orders.container';

const rootReducer = combineReducers({
  site: siteReducer,
  orderbook: orderBook,
});

const store = configureStore({
  reducer: rootReducer,
});

export type AppState = ReturnType<typeof rootReducer>;

export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<AppState> = useSelector;

ReactDOM.render(
  <Provider store={store}>
    <Site>
      <Orderbook />
    </Site>
  </Provider>,
  document.getElementById('root')
);
