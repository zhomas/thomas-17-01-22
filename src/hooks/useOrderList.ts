import { useEffect, useMemo, useRef, useState } from 'react';

export type Contract = 'PI_XBTUSD' | 'PI_ETHUSD';

interface OrderListSubscribeOptions {
  url: string;
}

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

interface Socketish {
  onmessage: (e: MessageEvent<string>) => void;
  onopen: (e: Event) => void;
  close: () => void;
  send: (data: string) => void;
  OPEN: number;
}

const defaultSocket: Socketish = {
  onmessage: function (e: MessageEvent<string>): void {
    throw new Error('Function not implemented.');
  },
  onopen: function (): void {
    throw new Error('Function not implemented.');
  },
  close: function (): void {
    throw new Error('Function not implemented.');
  },
  send: function (data: string): void {
    throw new Error('Function not implemented.');
  },
  OPEN: 0,
};

export const useOrderList = (opts: OrderListSubscribeOptions) => {
  const { url } = opts;
  const [contract, setContract] = useState<Contract>('PI_XBTUSD');
  const [instance, setInstance] = useState<Socketish>(defaultSocket);

  const bidsRef = useRef<Order[]>([]);
  const asksRef = useRef<Order[]>([]);
  const [bids, setBids] = useState<Order[]>([]);

  const onMessage = (e: MessageEvent<string>) => {
    const data: WSData = JSON.parse(e.data);

    if ('numLevels' in data) {
      // snapshot
      console.log(data);
      bidsRef.current = data.bids;
      setBids(data.bids);
      //setAsks(data.asks);
    } else if ('bids' in data && 'asks' in data) {
      // delta
      bidsRef.current = [...bidsRef.current, ...data.bids];
      console.log(bidsRef.current);
    }
  };

  const start = () => {
    const sock = new WebSocket(url);
    setInstance(sock as Socketish);
    sock.onmessage = onMessage;
    sock.onopen = () => {
      const sub = { event: 'subscribe', feed: 'book_ui_1', product_ids: [contract] };
      sock.send(JSON.stringify(sub));
    };
  };

  const stop = () => {
    instance?.close();
    setInstance(defaultSocket);
  };

  const toggleContract = () => {
    const next: Contract = contract === 'PI_XBTUSD' ? 'PI_ETHUSD' : 'PI_XBTUSD';
    const sub = { event: 'subscribe', feed: 'book_ui_1', product_ids: [next] };
    const unsub = {
      event: 'unsubscribe',
      feed: 'book_ui_1',
      product_ids: ['PI_XBTUSD', 'PI_ETHUSD'].filter((c) => c !== next),
    };

    instance.send(JSON.stringify(unsub));
    instance.send(JSON.stringify(sub));
    setBids([]);
    setContract(next);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setBids(bidsRef.current);
    }, 2000);

    return () => {
      clearInterval(interval);
    };
  });

  return {
    active: instance !== null && instance.OPEN === 1,
    bids,
    asks: asksRef.current,
    methods: {
      start,
      stop,
      toggleContract,
    },
  };
};
