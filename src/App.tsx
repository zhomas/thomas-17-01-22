import React, { useEffect, useRef, useState } from 'react';
import logo from './logo.svg';
import { Contract, useWebsocketInstance } from './hooks/useOrderList';
import './App.css';
import { connect, ConnectedProps } from 'react-redux';
import { AppDispatch, RootState } from '.';
import { changeContract, setSnapshot, updateDelta } from './orders.slice';

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

type Props = ConnectedProps<typeof connector>;

const App: React.FC<Props> = ({ onMessage, toggleFeed, contract }) => {
  const { ready, stop, start, emit } = useWebsocketInstance({
    url: 'wss://www.cryptofacilities.com/ws/v1',
    onMessage,
  });

  const handleToggleFeed = () => {
    toggleFeed(emit);
  };

  return (
    <div className="App">
      {ready ? <button onClick={stop}>Stop</button> : <button onClick={start}>Start</button>}
      <button onClick={handleToggleFeed}> {contract} </button>
      <h1>Ready: {ready.toString()}</h1>
      {/* <h3>Bid count: {bids.length}</h3> */}
    </div>
  );
};

const mapState = (state: RootState) => {
  return {
    contract: state.contract,
  };
};

const mapDispatch = (dispatch: AppDispatch) => {
  return {
    onMessage: (e: MessageEvent<any>) => {
      const data: WSData = JSON.parse(e.data);
      if (!('bids' in data && 'asks' in data)) return; // ignore

      if ('numLevels' in data) {
        // snapshot
        const action = setSnapshot({ bids: data.bids, asks: [] });
        dispatch(action);
        return;
      }

      const act = updateDelta({ bids: data.bids, asks: [] });
      dispatch(act);
    },
    toggleFeed: (sendMessage: (s: string) => void) => {
      dispatch(changeContract({ sendMessage }));
    },
  };
};

const connector = connect(mapState, mapDispatch);

export default connector(App);
