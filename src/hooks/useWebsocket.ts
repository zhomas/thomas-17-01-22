import { useEffect, useMemo, useRef, useState } from 'react';

interface OrderListSubscribeOptions {
  url: string;
  onOpen: (ws: WebSocket) => void;
  onMessage: (message: unknown) => void;
}

export const useWebsocketInstance = (opts: OrderListSubscribeOptions) => {
  const [instance, setInstance] = useState<WebSocket | null>(null);

  return {
    status: instance ? instance.readyState : -1,
    start: () => {
      const ws = new WebSocket(opts.url);
      ws.onopen = () => {
        opts.onOpen(ws);
      };

      ws.onmessage = (e) => {
        opts.onMessage(JSON.parse(e.data));
      };

      setInstance(ws);
    },
    stop: () => {
      console.log(instance);
      instance?.close();
    },
    emit: (message: string) => {
      instance?.send(message);
    },
  };
};
