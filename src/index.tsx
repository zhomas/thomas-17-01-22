import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import reportWebVitals from './reportWebVitals';
import reducer from './features/orders/orders.slice';
import { AsyncThunkPayloadCreator, configureStore, createAsyncThunk } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import OrderList from './features/orders';

const store = configureStore({ reducer });

type ThunkApiConfig = {
  dispatch: AppDispatch;
  state: RootState;
};

export type RootState = ReturnType<typeof reducer>;

export type AppDispatch = typeof store.dispatch;

export function createAppThunk<Returned = void, ThunkArg = void>(
  typePrefix: string,
  payloadCreator: AsyncThunkPayloadCreator<Returned, ThunkArg, ThunkApiConfig>
) {
  return createAsyncThunk<Returned, ThunkArg, ThunkApiConfig>(typePrefix, payloadCreator);
}

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <OrderList />
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
