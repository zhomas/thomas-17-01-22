import { useEffect, useMemo, useRef, useState } from 'react';

interface OrderListSubscribeOptions {
  url: string;
  interval: number;
  onOpen: (ws: WebSocket) => void;
  onMessage: (message: unknown) => void;
}

export const useWebsocketInstance = (opts: OrderListSubscribeOptions) => {
  const websocket = useRef<WebSocket | null>(null);
  const queue = useRef<string[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const next = queue.current.pop();
      opts.onMessage(next);
    }, opts.interval);

    return () => {
      clearInterval(interval);
    };
  });

  return {
    status: websocket.current ? websocket.current.readyState : -1,
    start: () => {
      const ws = new WebSocket(opts.url);
      ws.onopen = () => {
        console.log('opening connection');
        opts.onOpen(ws);
      };

      ws.onclose = () => {
        console.log('closing connection');
      };

      ws.onmessage = (e) => {
        queue.current.push(JSON.parse(e.data));
        //opts.onMessage(JSON.parse(e.data));
      };

      websocket.current = ws;
    },
    stop: () => {
      websocket.current?.close();
    },
    emit: (message: string) => {
      websocket.current?.send(message);
    },
  };
};
