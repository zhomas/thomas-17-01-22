import ReactDOM from 'react-dom';
import './index.css';
import reportWebVitals from './reportWebVitals';
import reducer from './features/orders/orders.slice';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import OrderList from './features/orders/orders.container';

const store = configureStore({ reducer });

export type AppState = ReturnType<typeof reducer>;

export type AppDispatch = typeof store.dispatch;

ReactDOM.render(
  <Provider store={store}>
    <OrderList />
  </Provider>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
