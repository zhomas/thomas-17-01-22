import React, { useCallback, useEffect, useState } from 'react';
import { useWebsocketInstance } from '../../hooks/useWebsocket';
import './App.css';
import { connect, ConnectedProps } from 'react-redux';
import { AppDispatch, AppState } from '../..';
import {
  toggleContract,
  setSnapshot,
  updateDelta,
  orderbookSelector,
  obSelector,
  tick,
} from './orders.slice';
import { getSubscribeMessage, isDeltaResponse, isSnapshotResponse } from './orders.api';
import StyledOrders from './orders.main';

type Props = ConnectedProps<typeof connector>;

const OrdersContainer: React.FC<Props> = ({ onMessage, toggleFeed, refresh }) => {
  const [hasFocus, setHasFocus] = useState(true);

  const { start, stop, emit, status } = useWebsocketInstance({
    url: 'wss://www.cryptofacilities.com/ws/v1',
    interval: 50,
    onMessage,
    onOpen: (ws: WebSocket) => {
      const subscribe = JSON.stringify(getSubscribeMessage('PI_XBTUSD'));
      ws.send(subscribe);
    },
  });

  const handleToggleFeed = () => toggleFeed(emit);

  const handleResume = () => {
    setHasFocus(true);
    start();
  };

  const onBlur = () => {
    setHasFocus(false);
    stop();
  };

  useEffect(() => {
    start();
    window.addEventListener('blur', onBlur);
    return () => {
      window.removeEventListener('blur', onBlur);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      refresh();
    }, 300);

    return () => {
      clearInterval(interval);
    };
  });

  return (
    <div className="App">
      <StyledOrders />
      {status > -1 && !hasFocus && <button onClick={handleResume}>Resume</button>}
      <button onClick={handleToggleFeed}> Switch Currency </button>
      <h2>Status: {status}</h2>
    </div>
  );
};

const mapDispatch = (dispatch: AppDispatch) => ({
  refresh: () => {
    dispatch(tick());
  },

  onMessage: (data: unknown) => {
    if (isSnapshotResponse(data)) {
      const { bids, asks } = data;
      dispatch(setSnapshot({ bids, asks }));
      return;
    }

    if (isDeltaResponse(data)) {
      const { bids, asks } = data;
      dispatch(updateDelta({ bids, asks }));
      return;
    }

    // ignore
  },
  toggleFeed: (sendMessage: (s: string) => void) => {
    dispatch(toggleContract({ sendMessage }));
  },
});

const connector = connect(undefined, mapDispatch);

export default connector(OrdersContainer);
