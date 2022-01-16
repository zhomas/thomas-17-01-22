import { useRef } from 'react';

interface WebsocketOptions<TResponse> {
  url: string;
  onOpen: () => void;
  onMessage: (message: TResponse) => void;
}

export function useWebsocket<TMessage, Tresponse>(opts: WebsocketOptions<Tresponse>) {
  const websocket = useRef<WebSocket | null>(null);
  return {
    start: () => {
      const ws = new WebSocket(opts.url);
      websocket.current = ws;

      ws.onopen = () => {
        console.log('opening connection...');
        opts.onOpen();
      };

      ws.onclose = () => {
        console.log('closing connection...');
      };

      ws.onmessage = (e) => {
        const result = JSON.parse(e.data);
        opts.onMessage(result);
      };
    },
    stop: () => {
      websocket.current?.close();
    },
    sendMessage: (message: TMessage) => {
      const json = JSON.stringify(message);
      websocket.current?.send(json);
    },
  };
}
