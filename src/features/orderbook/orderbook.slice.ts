import {
  createEntityAdapter,
  createSelector,
  createSlice,
  EntityState,
  PayloadAction,
} from '@reduxjs/toolkit';
import { tick } from '../../app/app.slice';
import { AppState } from '../..';
import { Contract, Order, OrderBook, OrderProps, OrderState } from './orderbook.types';

const orderAdapter = createEntityAdapter<Order>({
  selectId: (order) => order.price,
  sortComparer: (a, b) => b.price - a.price,
});

const initialState: OrderState = {
  bids: orderAdapter.getInitialState(),
  asks: orderAdapter.getInitialState(),
  stashedBids: [],
  stashedAsks: [],
  contract: 'PI_XBTUSD',
};

const getOrderProps = (level: number, total: number, size: number, price: number) => ({
  level,
  total,
  displayTotal: total.toLocaleString(),
  displaySize: size.toLocaleString(),
  displayPrice: price.toFixed(2).toLocaleString(),
});

const initialOrderbook = {
  getRatio: () => 0,
  bids: [],
  asks: [],
  spread: '0.0',
  spreadPercent: '0.00',
};

const { selectAll } = orderAdapter.getSelectors();
const bidsSelector = (state: AppState) => state.orderbook.bids;
const asksSelector = (state: AppState) => state.orderbook.asks;

const pruneEmptyOrders = (list: EntityState<Order>) => {
  const ids = list.ids.filter((id) => {
    const o = list.entities[id];
    return o && o.size === 0;
  });

  orderAdapter.removeMany(list, ids);
};

type OrderbookUpdate = { bids: Order[]; asks: Order[] };

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setContract: (state, action: PayloadAction<Contract>) => {
      state.contract = action.payload;
      state.bids = orderAdapter.getInitialState();
      state.asks = orderAdapter.getInitialState();
      state.stashedBids = [];
      state.stashedAsks = [];
    },
    setSnapshot: (state, action: PayloadAction<OrderbookUpdate>) => {
      orderAdapter.setAll(state.bids, action.payload.bids);
      orderAdapter.setAll(state.asks, action.payload.asks);
      state.stashedBids = [];
      state.stashedAsks = [];
      pruneEmptyOrders(state.bids);
      pruneEmptyOrders(state.asks);
    },
    updateDelta: (state, action: PayloadAction<OrderbookUpdate>) => {
      state.stashedBids.push(...action.payload.bids);
      state.stashedAsks.push(...action.payload.asks);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(tick, (state) => {
      orderAdapter.upsertMany(state.bids, state.stashedBids);
      orderAdapter.upsertMany(state.asks, state.stashedAsks);
      state.stashedBids = [];
      state.stashedAsks = [];
      pruneEmptyOrders(state.bids);
      pruneEmptyOrders(state.asks);
    });
  },
});

export const orderbookSelector = createSelector(
  bidsSelector,
  asksSelector,
  (bidDict, askDict): OrderBook => {
    const bidList = selectAll(bidDict);
    const askList = selectAll(askDict).reverse();
    const levels = Math.min(bidList.length, askList.length, 16);

    if (!levels) return initialOrderbook;

    const bids: OrderProps[] = [];
    const asks: OrderProps[] = [];
    const spread = Math.abs(bidList[0].price - askList[0].price);

    let bidsTotal = 0;
    let asksTotal = 0;

    for (let i = 0; i < levels; i++) {
      const bid = bidList[i];
      const ask = askList[i];

      bids.push(getOrderProps(i + 1, bidsTotal + bid.size, bid.size, bid.price));
      asks.push(getOrderProps(i + 1, asksTotal + ask.size, ask.size, ask.price));

      bidsTotal += bid.size;
      asksTotal += ask.size;
    }

    return {
      bids,
      asks,
      spread: spread.toFixed(1).toLocaleString(),
      spreadPercent: ((spread / bidList[0].price) * 100).toFixed(2),
      getRatio: (o) => o.total / Math.max(asksTotal, bidsTotal),
    };
  }
);

export const activeContractSelector = (state: AppState) => state.orderbook.contract;

export const { setContract, setSnapshot, updateDelta } = ordersSlice.actions;

export default ordersSlice.reducer;
