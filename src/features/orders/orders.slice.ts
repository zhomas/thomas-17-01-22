import {
  createAsyncThunk,
  createEntityAdapter,
  createSlice,
  EntityState,
  PayloadAction,
} from '@reduxjs/toolkit';
import { Contract, getSubscribeMessage, getUnsubscrbeMessage } from './orders.api';

type Order = [price: number, size: number];
type OrderModel = { price: number; size: number; total: number };

const orderAdapter = createEntityAdapter<Order>({
  selectId: (order) => order[0],
  sortComparer: (a, b) => a[0] - b[0],
});

const pruneEmptyOrders = (list: EntityState<Order>) => {
  const ids = list.ids.filter((id) => {
    const o = list.entities[id];
    return o && o[1] === 0;
  });

  orderAdapter.removeMany(list, ids);
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
    setSnapshot: (state, action: PayloadAction<{ bids: Order[]; asks: Order[] }>) => {
      orderAdapter.setAll(state.bids, action.payload.bids);
      pruneEmptyOrders(state.bids);
    },
    updateDelta: (state, action: PayloadAction<{ bids: Order[]; asks: Order[] }>) => {
      orderAdapter.upsertMany(state.bids, action.payload.bids);
      pruneEmptyOrders(state.bids);
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

function orderIsDefined(x: Order | undefined): x is Order {
  return !!x;
}

export const ordersSelector = (orders: EntityState<Order>) => {
  return Object.values(orders.entities)
    .filter(orderIsDefined)
    .slice(0, 20)
    .reduce((obj, item, i) => {
      const prev = i > 0 ? obj[i - 1].total : 0;
      return [...obj, { price: item[0], size: item[1], total: prev + item[1] }];
    }, [] as OrderModel[]);
};

export const { setSnapshot, updateDelta } = ordersSlice.actions;

export default ordersSlice.reducer;
