import {
  createAsyncThunk,
  createEntityAdapter,
  createSlice,
  EntityState,
  PayloadAction,
} from '@reduxjs/toolkit';
import _ from 'lodash';
import { Contract, getSubscribeMessage, getUnsubscrbeMessage } from './orders.api';

export type OrderTuple = [price: number, size: number];

type Order = { price: number; size: number };
export type OrderModel = { price: number; size: number; total: number; ratio: number };

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
}

const initialState: OrderState = {
  bids: orderAdapter.getInitialState(),
  asks: orderAdapter.getInitialState(),
  contract: 'PI_XBTUSD',
};

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setSnapshot: (state, action: PayloadAction<{ bids: OrderTuple[]; asks: OrderTuple[] }>) => {
      orderAdapter.setAll(state.bids, getOrderObjects(action.payload.bids));
      orderAdapter.setAll(state.asks, getOrderObjects(action.payload.asks));
      pruneEmptyOrders(state.bids);
      pruneEmptyOrders(state.asks);
    },
    updateDelta: (state, action: PayloadAction<{ bids: OrderTuple[]; asks: OrderTuple[] }>) => {
      orderAdapter.upsertMany(state.bids, getOrderObjects(action.payload.bids));
      orderAdapter.upsertMany(state.asks, getOrderObjects(action.payload.asks));
      pruneEmptyOrders(state.bids);
      pruneEmptyOrders(state.asks);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(toggleContract.fulfilled, (state, action) => {
      state.contract = action.payload;
      state.bids = orderAdapter.getInitialState();
      state.asks = orderAdapter.getInitialState();
    });
  },
});

export const toggleContract = createAsyncThunk<Contract, { sendMessage: (x: string) => void }>(
  'orders/toggleContract',
  ({ sendMessage }, { getState }) => {
    const { contract } = getState() as OrderState;

    const next = contract === 'PI_XBTUSD' ? 'PI_ETHUSD' : 'PI_XBTUSD';
    const subscribe = JSON.stringify(getSubscribeMessage(next));
    const unsubscribe = JSON.stringify(getUnsubscrbeMessage(contract));

    sendMessage(subscribe);
    sendMessage(unsubscribe);

    return next;
  }
);

interface SingleOrder {
  price: number;
  size: number;
  level: number;
  total: number;
}

export interface OrderBook {
  maxTotal: number;
  bids: SingleOrder[];
  asks: SingleOrder[];
}

export const orderbookSelector = (state: OrderState): OrderBook => {
  const bidList = selectAll(state.bids);
  const askList = selectAll(state.asks).reverse();
  const levels = Math.min(bidList.length, askList.length, 16);

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
    });

    asks.push({
      price: ask.price,
      size: ask.size,
      level: i + 1,
      total: asksTotal + ask.size,
    });

    bidsTotal += bid.size;
    asksTotal += ask.size;
  }

  return {
    maxTotal: Math.max(bidsTotal, asksTotal),
    bids,
    asks,
  };
};

export const derivedStateSelector = (state: OrderState) => {
  const bidList = selectAll(state.bids).slice(0, 16);
  const askList = selectAll(state.asks).slice(0, 16);
  let maxTotal = 0;

  bidList.reduce((total, item) => {
    const t = total + item.size;
    maxTotal = Math.max(maxTotal, t);
    return t;
  }, 0);

  askList.reduce((total, item) => {
    const t = total + item.size;
    maxTotal = Math.max(maxTotal, t);
    return t;
  }, 0);

  const getOrdersModel = (list: Order[]) => {
    return list.reduce((arr, item, i) => {
      const { price, size } = item;
      const runningTotal = i > 0 ? arr[i - 1].total : 0;
      const total = runningTotal + size;
      return [...arr, { price, size, total, ratio: total / maxTotal }];
    }, [] as OrderModel[]);
  };

  const getSpread = () => {
    if (!bidList.length) return 0;
    if (!askList.length) return 0;
    return Math.abs(bidList[0].price - askList[0].price);
  };

  const getSpreadRatio = () => {
    if (!bidList.length) return 0;
    if (!askList.length) return 0;
    return getSpread() / bidList[0].price;
  };

  return {
    contract: state.contract,
    bids: getOrdersModel(bidList),
    asks: getOrdersModel(askList),
    spread: getSpread(),
    spreadRatio: getSpreadRatio(),
  };
};

export const { setSnapshot, updateDelta } = ordersSlice.actions;

export default ordersSlice.reducer;
