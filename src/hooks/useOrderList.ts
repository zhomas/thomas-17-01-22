import { useEffect, useMemo, useRef, useState } from 'react';

export type Contract = 'PI_XBTUSD' | 'PI_ETHUSD';

interface OrderListSubscribeOptions {
  url: string;
}

interface Socket {
  onmessage: (this: Socket, e: MessageEvent<any>) => void;
}

const defaultSocket: Socket = {
  onmessage: () => {},
};

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

interface OrderList {
  bids: number;
}

export const useOrderList = (opts: OrderListSubscribeOptions) => {
  const { url } = opts;
  const [contract, setContract] = useState<Contract>('PI_XBTUSD');
  const [instance, setInstance] = useState<WebSocket | null>(null);
  const [bids, setBids] = useState<Order[]>([]);
  const [asks, setAsks] = useState<Order[]>([]);

  const onMessage = (e: MessageEvent<string>) => {
    const data: WSData = JSON.parse(e.data);

    if ('numLevels' in data) {
      // snapshot
      console.log(data);
      setBids(data.bids);
      //setAsks(data.asks);
    } else if ('bids' in data && 'asks' in data) {
      // delta
      setBids((currentBids) => [...currentBids, ...data.bids]);
      setAsks((currentAsks) => [...currentAsks, ...data.asks]);
    }
  };

  const start = () => {
    const sock = new WebSocket(url);
    setInstance(sock);
    sock.onmessage = onMessage;
    sock.onopen = () => {
      const sub = { event: 'subscribe', feed: 'book_ui_1', product_ids: [contract] };
      sock.send(JSON.stringify(sub));
    };
  };

  const stop = () => {
    instance?.close();
    setInstance(null);
  };

  const toggleContract = () => {
    if (!instance) return;
    const next: Contract = contract === 'PI_XBTUSD' ? 'PI_ETHUSD' : 'PI_XBTUSD';
    const sub = { event: 'subscribe', feed: 'book_ui_1', product_ids: [next] };
    const unsub = {
      event: 'unsubscribe',
      feed: 'book_ui_1',
      product_ids: ['PI_XBTUSD', 'PI_ETHUSD'].filter((c) => c !== next),
    };

    instance.send(JSON.stringify(unsub));
    instance.send(JSON.stringify(sub));
    setContract(next);
  };

  return {
    active: instance !== null && instance.OPEN === 1,
    bids,
    asks,
    methods: {
      start,
      stop,
      toggleContract,
    },
  };
};
