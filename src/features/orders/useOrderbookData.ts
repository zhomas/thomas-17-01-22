import { useAppDispatch, useAppSelector } from '../..';
import { useWebsocket } from '../../hooks/useWebsocket';
import { Contract } from './orders.slice';
import { activeContractSelector, setSnapshot, setContract, updateDelta } from './orders.slice';

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

type APIRequest = {
  event: 'subscribe' | 'unsubscribe';
  feed: 'book_ui_1';
  product_ids: Contract[];
};

const getSubscribeMessage = (to: Contract): APIRequest => ({
  event: 'subscribe',
  feed: 'book_ui_1',
  product_ids: [to],
});

const getUnsubscrbeMessage = (from: Contract): APIRequest => ({
  event: 'unsubscribe',
  feed: 'book_ui_1',
  product_ids: [from],
});

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
  const dispatch = useAppDispatch();
  const contract = useAppSelector(activeContractSelector);

  const { start, stop, sendMessage } = useWebsocket<APIRequest, APIResponse>({
    url: 'wss://www.cryptofacilities.com/ws/v1',
    onOpen: () => {
      const msg = getSubscribeMessage('PI_XBTUSD');
      sendMessage(msg);
    },
    onMessage: (data) => {
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
    },
  });

  return {
    start,
    stop,
    switchCurrency: () => {
      const next = contract === 'PI_XBTUSD' ? 'PI_ETHUSD' : 'PI_XBTUSD';
      const subscribe = getSubscribeMessage(next);
      const unsubscribe = getUnsubscrbeMessage(contract);

      sendMessage(subscribe);
      sendMessage(unsubscribe);

      dispatch(setContract(next));
    },
  };
};
