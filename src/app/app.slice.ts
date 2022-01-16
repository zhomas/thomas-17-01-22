import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppState } from '..';

interface SiteState {
  hasFocus: boolean;
}

const initialState: SiteState = {
  hasFocus: true,
};

const siteSlice = createSlice({
  name: 'site',
  initialState,
  reducers: {
    setHasFocus: (state, action: PayloadAction<boolean>) => {
      state.hasFocus = action.payload;
    },
    tick: () => {
      console.log('tick');
    },
  },
});

export const hasFocusSelector = (state: AppState) => state.site.hasFocus;

export const { tick, setHasFocus } = siteSlice.actions;

export default siteSlice.reducer;
