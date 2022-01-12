import {
  createAsyncThunk,
  createEntityAdapter,
  createSlice,
  EntityState,
  PayloadAction,
} from '@reduxjs/toolkit';
import { Contract, getSubscribeMessage, getUnsubscrbeMessage } from './orders.api';

type Order = [price: number, size: number];

const orderAdapter = createEntityAdapter<Order>({
  selectId: (order) => order[0],
  sortComparer: (a, b) => b[0] - a[0],
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

export const toggleContract = createAsyncThunk<Contract, { sendMessage: (x: string) => void }>(
  'orders/toggleContract',
  ({ sendMessage }, { getState }) => {
    const { contract } = getState() as OrderState;
    const next = contract === 'PI_XBTUSD' ? 'PI_ETHUSD' : 'PI_XBTUSD';
    const sub = JSON.stringify(getSubscribeMessage(next));
    const unsub = JSON.stringify(getUnsubscrbeMessage(contract));
    sendMessage(sub);
    sendMessage(unsub);
    return next;
  }
);

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

export const { setSnapshot, updateDelta } = ordersSlice.actions;

export default ordersSlice.reducer;
