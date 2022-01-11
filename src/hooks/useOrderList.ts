import { useEffect, useMemo, useState } from 'react';

export type Contract = 'PI_XBTUSD' | 'PI_ETHUSD';

interface OrderListSubscribeOptions {
  url: string;
  contract: Contract;
  active: boolean;
}

export const useOrderList = (opts: OrderListSubscribeOptions) => {
  const { url, contract, active } = opts;
  const [open, setOpen] = useState(false);
  const ws = useMemo(() => new WebSocket(url), [url]);

  useEffect(() => {
    ws.onopen = () => setOpen(true);
    ws.onclose = () => setOpen(false);

    ws.onmessage = console.log;
    return () => {
      ws.close();
    };
  }, [ws]);

  useEffect(() => {
    if (!open) return;
    console.log('i am now open');

    const sub = { event: 'subscribe', feed: 'book_ui_1', product_ids: [contract] };
    const unsub = {
      event: 'unsubscribe',
      feed: 'book_ui_1',
      product_ids: ['PI_XBTUSD', 'PI_ETHUSD'].filter((c) => c !== contract),
    };

    ws.send(JSON.stringify(unsub));
    ws.send(JSON.stringify(sub));
  }, [open, contract]);

  // useEffect(() => {
  //   console.log('ws now open', ws.OPEN);
  //   const others = ['PI_XBTUSD', 'PI_ETHUSD'].filter((c) => c !== contract).map((c) => `"${c}"`);
  //   const unsub = `{"event":"unsubscribe","feed":"book_ui_1","product_ids":[${others.toString()}]}`;
  //   console.log(unsub);

  //   ws.send(unsub);
  // }, [ws.OPEN]);

  // useEffect(() => {
  //   const others = ['PI_XBTUSD', 'PI_ETHUSD'].filter((c) => c !== contract).map((c) => `"${c}"`);
  //   const unsub = `{"event":"unsubscribe","feed":"book_ui_1","product_ids":[${others.toString()}]}`;
  //   console.log(unsub);

  //   ws.send(unsub);
  // }, [contract]);

  // useEffect(() => {
  //   ws.onopen = () => {
  //     const message = '{"event":"subscribe","feed":"book_ui_1","product_ids":["PI_XBTUSD"]}';
  //     ws.send(message);
  //   };

  //   // ws.onmessage = (msg) => {
  //   //   console.log("message", msg);
  //   // };

  //   return () => {
  //     ws.close();
  //   };
  // }, [ws]);
};
