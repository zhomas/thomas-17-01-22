import React, { useCallback, useEffect, useState } from 'react';
import { useWebsocketInstance } from '../../hooks/useWebsocket';
import './App.css';
import { connect, ConnectedProps } from 'react-redux';
import { AppDispatch, AppState } from '../../';
import {
  toggleContract,
  setSnapshot,
  updateDelta,
  derivedStateSelector,
  orderbookSelector,
} from './orders.slice';
import { getSubscribeMessage, isDeltaResponse, isSnapshotResponse } from './orders.api';
import StyledOrders from './orders.style';

type Props = ConnectedProps<typeof connector>;

const Orders: React.FC<Props> = ({
  onMessage,
  onOpen,
  toggleFeed,
  bids,
  asks,
  spread,
  spreadPercent,
  getRatio,
}) => {
  const [hasFocus, setHasFocus] = useState(true);

  const { start, stop, emit, status } = useWebsocketInstance({
    url: 'wss://www.cryptofacilities.com/ws/v1',
    interval: 50,
    onMessage,
    onOpen,
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

  console.log('render');

  return (
    <div className="App">
      <StyledOrders
        bids={bids}
        asks={asks}
        getRatio={getRatio}
        spread={spread}
        spreadPercent={spreadPercent}
      />
      {status > -1 && !hasFocus && <button onClick={handleResume}>Resume</button>}
      <button onClick={handleToggleFeed}> Switch Currency </button>
      <h2>Status: {status}</h2>
    </div>
  );
};

const mapState = (state: AppState) => {
  return {
    ...orderbookSelector(state),
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

const connector = connect(mapState, mapDispatch);

export default connect(mapState, mapDispatch)(Orders);
