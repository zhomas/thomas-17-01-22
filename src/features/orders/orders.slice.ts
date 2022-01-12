import {
  createAsyncThunk,
  createEntityAdapter,
  createSlice,
  EntityState,
  PayloadAction,
} from '@reduxjs/toolkit';
import { Contract, getSubscribeMessage, getUnsubscrbeMessage } from './orders.api';

export type OrderTuple = [price: number, size: number];

type Order = { price: number; size: number };
type OrderModel = { price: number; size: number; total: number; ratio: number };

const orderAdapter = createEntityAdapter<Order>({
  selectId: (order) => order.price,
  sortComparer: (a, b) => a.price - b.price,
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

export const selector = (state: OrderState) => {
  let max = 0;
  const bidList = selectAll(state.bids).slice(0, 10);
  const askList = selectAll(state.asks).slice(0, 10);

  bidList.reduce((total, item) => {
    const t = total + item.size;
    max = Math.max(max, t);
    return t;
  }, 0);

  askList.reduce((total, item) => {
    const t = total + item.size;
    max = Math.max(max, t);
    return t;
  }, 0);

  const ordersSelector = (list: Order[]) => {
    return list.reduce((arr, item, i) => {
      const { price, size } = item;
      const runningTotal = i > 0 ? arr[i - 1].total : 0;
      const total = runningTotal + size;
      return [...arr, { price, size, total, ratio: total / max }];
    }, [] as OrderModel[]);
  };

  return {
    bids: ordersSelector(bidList),
    asks: ordersSelector(askList),
  };
};

export const { setSnapshot, updateDelta } = ordersSlice.actions;

export default ordersSlice.reducer;
