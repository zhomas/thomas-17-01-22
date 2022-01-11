import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type Order = [price: number, size: number];

interface OrderState {
  bids: { [K: number]: number };
  asks: { [K: number]: number };
}

const initialState: OrderState = {
  bids: {},
  asks: {},
};

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setSnapshot: (state, action: PayloadAction<{ bids: Order[]; asks: Order[] }>) => {
      const { bids, asks } = action.payload;
      for (const bid of bids) {
        const [price, size] = bid;
        state.bids[price] = size;
      }
    },
    updateDelta: (state, action: PayloadAction<{ bids: Order[]; asks: Order[] }>) => {
      for (const bid of action.payload.bids) {
        const [price, size] = bid;
        state.bids[price] = size;
      }

      state.bids = Object.entries(state.bids)
        .filter(([_, v]) => v > 0)
        .reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {});
    },
  },
});

export const { setSnapshot, updateDelta } = ordersSlice.actions;

export default ordersSlice.reducer;
