type Order = [price: number, size: number];

export type Contract = 'PI_XBTUSD' | 'PI_ETHUSD';

interface Snapshot {
  numLevels: number;
  feed: string;
  bids: Order[];
  asks: Order[];
  product_id: Contract;
}

interface Delta {
  feed: string;
  product_id: Contract;
  bids: Order[];
  asks: Order[];
}

type APIResponse = Delta | Snapshot;

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

function isOrderListResponse(x: unknown): x is APIResponse {
  if (x && typeof x === 'object') {
    return 'bids' in x && 'asks' in x;
  }

  return false;
}

export function isSnapshotResponse(x: unknown): x is Snapshot {
  return isOrderListResponse(x) && 'numLevels' in x;
}

export function isDeltaResponse(x: unknown): x is Delta {
  return isOrderListResponse(x) && !isSnapshotResponse(x);
}
