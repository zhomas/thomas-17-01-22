import { useDispatch } from 'react-redux';
import { AppDispatch } from '../..';
import { useWebsocketInstance } from '../../hooks/useWebsocket';
import { Contract, getSubscribeMessage } from './orders.api';
import { setSnapshot, toggleContract, updateDelta } from './orders.slice';

interface Snapshot {
  numLevels: number;
  feed: string;
  bids: [number, number][];
  asks: [number, number][];
  product_id: Contract;
}

interface Delta {
  feed: string;
  product_id: Contract;
  bids: [number, number][];
  asks: [number, number][];
}

type APIResponse = Delta | Snapshot;

function isOrderListResponse(x: unknown): x is APIResponse {
  if (x && typeof x === 'object') {
    return 'bids' in x && 'asks' in x;
  }

  return false;
}

function isSnapshotResponse(x: unknown): x is Snapshot {
  return isOrderListResponse(x) && 'numLevels' in x;
}

function isDeltaResponse(x: unknown): x is Delta {
  return isOrderListResponse(x) && !isSnapshotResponse(x);
}

export const useOrderbookData = () => {
  const dispatch = useDispatch<AppDispatch>();

  const onOpen = (ws: WebSocket) => {
    const subscribe = JSON.stringify(getSubscribeMessage('PI_XBTUSD'));
    ws.send(subscribe);
  };

  const onMessage = (data: unknown) => {
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
  };

  const { start, stop, emit, status } = useWebsocketInstance({
    url: 'wss://www.cryptofacilities.com/ws/v1',
    interval: 50,
    onMessage,
    onOpen,
  });

  const switchCurrency = () => {
    dispatch(toggleContract({ sendMessage: emit }));
  };

  return {
    start,
    stop,
    switchCurrency,
  };
};
