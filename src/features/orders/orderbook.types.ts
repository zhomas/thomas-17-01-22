import { EntityState } from '@reduxjs/toolkit';

export interface Snapshot {
  numLevels: number;
  feed: string;
  bids: [number, number][];
  asks: [number, number][];
  product_id: Contract;
}

export interface Delta {
  feed: string;
  product_id: Contract;
  bids: [number, number][];
  asks: [number, number][];
}

export type Contract = 'PI_XBTUSD' | 'PI_ETHUSD';
export type Order = { price: number; size: number };

export interface OrderState {
  bids: EntityState<Order>;
  asks: EntityState<Order>;
  contract: Contract;
  stashedBids: Order[];
  stashedAsks: Order[];
}

export interface OrderProps {
  level: number;
  total: number;
  displayPrice: string;
  displayTotal: string;
  displaySize: string;
}

export interface OrderBook {
  bids: OrderProps[];
  asks: OrderProps[];
  spread: string;
  spreadPercent: string;
  getRatio: (o: OrderProps) => number;
}

export type APIResponse = Delta | Snapshot;

export type APIRequest = {
  event: 'subscribe' | 'unsubscribe';
  feed: 'book_ui_1';
  product_ids: Contract[];
};

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
