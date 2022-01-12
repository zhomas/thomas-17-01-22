import React, { useCallback, useEffect, useState } from 'react';
import { useWebsocketInstance } from '../../hooks/useWebsocket';
import './App.css';
import { connect, ConnectedProps } from 'react-redux';
import { AppDispatch, RootState } from '../../';
import { toggleContract, setSnapshot, updateDelta, ordersSelector } from './orders.slice';
import { getSubscribeMessage, isDeltaResponse, isSnapshotResponse } from './orders.api';

type Props = ConnectedProps<typeof connector>;

const Orders: React.FC<Props> = ({ onMessage, onOpen, toggleFeed, contract, orders }) => {
  const [hasFocus, setHasFocus] = useState(true);

  const { stop, start, emit, status } = useWebsocketInstance({
    url: 'wss://www.cryptofacilities.com/ws/v1',
    onMessage,
    onOpen,
  });

  const handleToggleFeed = () => toggleFeed(emit);

  const handleResume = useCallback(() => {
    setHasFocus(true);
    start();
  }, []);

  const onBlur = useCallback(() => {
    setHasFocus(false);
    stop();
  }, []);

  useEffect(() => {
    start();
    window.addEventListener('blur', onBlur);
    return () => {
      window.removeEventListener('blur', onBlur);
    };
  }, []);

  console.log(orders);

  return (
    <div className="App">
      {status > -1 && !hasFocus && <button onClick={handleResume}>Resume</button>}
      <button onClick={handleToggleFeed}> {contract} </button>
      <h2>Status: {status}</h2>
    </div>
  );
};

const mapState = (state: RootState) => {
  return {
    orders: ordersSelector(state.bids),
    contract: state.contract,
    onOpen: (ws: WebSocket) => {
      const subscribe = JSON.stringify(getSubscribeMessage(state.contract));
      ws.send(subscribe);
    },
  };
};

const mapDispatch = (dispatch: AppDispatch) => ({
  onMessage: (data: unknown) => {
    if (isSnapshotResponse(data)) {
      const { bids, asks } = data;
      dispatch(setSnapshot({ bids, asks: [] }));
      return;
    }

    if (isDeltaResponse(data)) {
      const { bids, asks } = data;
      dispatch(updateDelta({ bids, asks: [] }));
      return;
    }

    // ignore
  },
  toggleFeed: (sendMessage: (s: string) => void) => {
    dispatch(toggleContract({ sendMessage }));
  },
});

const connector = connect(mapState, mapDispatch);

export default connect(mapState, mapDispatch)(Orders);
