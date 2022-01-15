import { OrderTuple } from './orders.slice';

export type Contract = 'PI_XBTUSD' | 'PI_ETHUSD';

type APIRequest = {
  event: 'subscribe' | 'unsubscribe';
  feed: 'book_ui_1';
  product_ids: Contract[];
};

export const getSubscribeMessage = (to: Contract): APIRequest => ({
  event: 'subscribe',
  feed: 'book_ui_1',
  product_ids: [to],
});

export const getUnsubscrbeMessage = (from: Contract): APIRequest => ({
  event: 'unsubscribe',
  feed: 'book_ui_1',
  product_ids: [from],
});
