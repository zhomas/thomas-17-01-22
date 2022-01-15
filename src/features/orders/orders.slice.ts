import {
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
  createSlice,
  EntityState,
  PayloadAction,
} from '@reduxjs/toolkit';
import { tick } from '../site/site.slice';
import { AppState } from '../..';

export type Contract = 'PI_XBTUSD' | 'PI_ETHUSD';
export type OrderTuple = [price: number, size: number];

type Order = { price: number; size: number };

const orderAdapter = createEntityAdapter<Order>({
  selectId: (order) => order.price,
  sortComparer: (a, b) => b.price - a.price,
});

const { selectAll } = orderAdapter.getSelectors();

const pruneEmptyOrders = (list: EntityState<Order>) => {
  const ids = list.ids.filter((id) => {
    const o = list.entities[id];
    return o && o.size === 0;
  });

  orderAdapter.removeMany(list, ids);
};

const getOrderObjects = (list: OrderTuple[]): Order[] => {
  return list.map((o) => ({ price: o[0], size: o[1] }));
};

interface OrderState {
  bids: EntityState<Order>;
  asks: EntityState<Order>;
  contract: Contract;
  lastUpdateTime: number;
  tickInterval: number;
  stashedBids: OrderTuple[];
  stashedAsks: OrderTuple[];
}

const initialState: OrderState = {
  bids: orderAdapter.getInitialState(),
  asks: orderAdapter.getInitialState(),
  stashedBids: [],
  stashedAsks: [],
  contract: 'PI_XBTUSD',
  lastUpdateTime: -1,
  tickInterval: 1000,
};

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setContract: (state, action: PayloadAction<Contract>) => {
      if (action.payload === state.contract) return;
      state.contract = action.payload;
      state.bids = orderAdapter.getInitialState();
      state.asks = orderAdapter.getInitialState();
    },
    setSnapshot: (state, action: PayloadAction<{ bids: OrderTuple[]; asks: OrderTuple[] }>) => {
      orderAdapter.setAll(state.bids, getOrderObjects(action.payload.bids));
      orderAdapter.setAll(state.asks, getOrderObjects(action.payload.asks));
      pruneEmptyOrders(state.bids);
      pruneEmptyOrders(state.asks);
    },
    updateDelta: (state, action: PayloadAction<{ bids: OrderTuple[]; asks: OrderTuple[] }>) => {
      state.stashedBids.push(...action.payload.bids);
      state.stashedAsks.push(...action.payload.asks);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(tick, (state) => {
      orderAdapter.upsertMany(state.bids, getOrderObjects(state.stashedBids));
      orderAdapter.upsertMany(state.asks, getOrderObjects(state.stashedAsks));
      state.stashedBids = [];
      state.stashedAsks = [];
      pruneEmptyOrders(state.bids);
      pruneEmptyOrders(state.asks);
    });
  },
});

interface SingleOrder {
  price: number;
  size: number;
  level: number;
  total: number;
  displayPrice: string;
  displayTotal: string;
  displaySize: string;
}

export interface OrderBook {
  getRatio: (o: SingleOrder) => number;
  bids: SingleOrder[];
  asks: SingleOrder[];
  spread: string;
  spreadPercent: string;
}

const bidsSelector = (state: AppState) => state.orderbook.bids;
const asksSelector = (state: AppState) => state.orderbook.asks;
export const activeContractSelector = (state: AppState) => state.orderbook.contract;

export const obSelector = createSelector(
  bidsSelector,
  asksSelector,
  (bidObj, askObj): OrderBook => {
    const bidList = selectAll(bidObj);
    const askList = selectAll(askObj).reverse();

    const levels = Math.min(bidList.length, askList.length, 16);

    if (!levels) {
      return {
        getRatio: () => 0,
        bids: [],
        asks: [],
        spread: '',
        spreadPercent: '',
      };
    }

    const bids: SingleOrder[] = [];
    const asks: SingleOrder[] = [];

    let bidsTotal = 0;
    let asksTotal = 0;

    for (let i = 0; i < levels; i++) {
      const bid = bidList[i];
      const ask = askList[i];

      bids.push({
        price: bid.price,
        size: bid.size,
        level: i + 1,
        total: bidsTotal + bid.size,
        displayTotal: (bidsTotal + bid.size).toLocaleString(),
        displaySize: bid.size.toLocaleString(),
        displayPrice: bid.price.toFixed(2).toLocaleString(),
      });

      asks.push({
        price: ask.price,
        size: ask.size,
        level: i + 1,
        total: asksTotal + ask.size,
        displayTotal: (asksTotal + ask.size).toLocaleString(),
        displaySize: ask.size.toLocaleString(),
        displayPrice: ask.price.toFixed(2).toLocaleString(),
      });

      bidsTotal += bid.size;
      asksTotal += ask.size;
    }

    const maxTotal = Math.max(asksTotal, bidsTotal);

    const spread = Math.abs(bids[0].price - asks[0].price);

    return {
      getRatio: (o) => o.total / maxTotal,
      bids,
      asks,
      spread: spread.toFixed(1).toLocaleString(),
      spreadPercent: ((spread / bids[0].price) * 100).toFixed(2),
    };
  }
);

export const { setContract, setSnapshot, updateDelta } = ordersSlice.actions;

export default ordersSlice.reducer;
