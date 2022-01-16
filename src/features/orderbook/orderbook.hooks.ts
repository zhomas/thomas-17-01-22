import { useAppDispatch, useAppSelector } from '../..';
import { useWebsocket } from '../../hooks/useWebsocket';
import {
  APIRequest,
  APIResponse,
  Contract,
  isDeltaResponse,
  isSnapshotResponse,
  Order,
} from './orderbook.types';
import { activeContractSelector, setSnapshot, setContract, updateDelta } from './orderbook.slice';

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

const getOrderObject = (o: [number, number]): Order => {
  return {
    price: o[0],
    size: o[1],
  };
};

export const useOrderbookData = () => {
  const dispatch = useAppDispatch();
  const contract = useAppSelector(activeContractSelector);

  const { start, stop, sendMessage } = useWebsocket<APIRequest, APIResponse>({
    url: 'wss://www.cryptofacilities.com/ws/v1',
    onOpen: () => {
      const msg = getSubscribeMessage(contract);
      sendMessage(msg);
    },
    onMessage: (data) => {
      if (isSnapshotResponse(data)) {
        const bids = data.bids.map((b) => getOrderObject(b));
        const asks = data.asks.map((a) => getOrderObject(a));
        dispatch(setSnapshot({ bids, asks }));
        return;
      }

      if (isDeltaResponse(data)) {
        const bids = data.bids.map((b) => getOrderObject(b));
        const asks = data.asks.map((a) => getOrderObject(a));
        dispatch(updateDelta({ bids, asks }));
        return;
      }
    },
  });

  const switchCurrency = () => {
    const next = contract === 'PI_XBTUSD' ? 'PI_ETHUSD' : 'PI_XBTUSD';
    const subscribe = getSubscribeMessage(next);
    const unsubscribe = getUnsubscrbeMessage(contract);
    dispatch(setContract(next));
    sendMessage(subscribe);
    sendMessage(unsubscribe);
  };

  return { start, stop, switchCurrency };
};
