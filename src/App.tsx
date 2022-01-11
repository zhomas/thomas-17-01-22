import React, { useEffect, useRef, useState } from 'react';
import logo from './logo.svg';
import { Contract, useWebsocketInstance } from './hooks/useOrderList';
import './App.css';
import { connect, ConnectedProps } from 'react-redux';
import { AppDispatch, RootState } from '.';
import { setSnapshot, updateDelta } from './orders.slice';

type Order = [price: number, size: number];

type WSData =
  | { event: 'info'; version: number }
  | { event: 'subscribed'; feed: string; product_ids: Contract[] }
  | Snapshot
  | { feed: string; product_id: Contract; bids: Order[]; asks: Order[] };

interface Snapshot {
  numLevels: number;
  feed: string;
  bids: Order[];
  asks: Order[];
  product_id: Contract;
}

type OrderDict = { [K: number]: number };

type Props = ConnectedProps<typeof connector>;

const App: React.FC<Props> = ({ updateSnapshot, updateDelta }) => {
  const [bids, setBids] = useState<OrderDict>({});

  const { ready, stop, start } = useWebsocketInstance({
    url: 'wss://www.cryptofacilities.com/ws/v1',
    onMessage: (e) => {
      const data: WSData = JSON.parse(e.data);
      if (!('bids' in data && 'asks' in data)) return; // ignore

      if ('numLevels' in data) {
        // snapshot
        updateSnapshot(data.bids);
        return;
      }

      updateDelta(data.bids);

      console.log(data);
    },
  });

  return (
    <div className="App">
      {ready ? <button onClick={stop}>Stop</button> : <button onClick={start}>Start</button>}
      <h1>Ready: {ready.toString()}</h1>
      {/* <h3>Bid count: {bids.length}</h3> */}
    </div>
  );
};

const mapState = (state: RootState) => {
  return {};
};

const mapDispatch = (dispatch: AppDispatch) => {
  return {
    updateSnapshot: (bids: Order[]) => {
      const action = setSnapshot({ bids, asks: [] });
      dispatch(action);
    },
    updateDelta: (bids: Order[]) => {
      const action = updateDelta({ bids, asks: [] });
      dispatch(action);
    },
  };
};

const connector = connect(mapState, mapDispatch);

export default connector(App);
