import { useEffect, useRef, useState } from 'react';

import useIsMounted from './useIsMounted';
import usePersistCallback from './usePersistCallback';

interface Socket<M> {
  readyState: number;
  connect: () => void;
  send: WebSocket['send'];
  message?: MessageEvent<M>;
  disconnect: (code?: number, reason?: string) => void;
}

export interface Options<M> {
  manual?: boolean;
  reconnectLimit?: number;
  reconnectInterval?: number;
  protocols?: string | string[];
  onOpen?: (event: Event) => void;
  onError?: (event: Event) => void;
  onClose?: (event: CloseEvent) => void;
  onMessage?: (event: MessageEvent<M>) => void;
}

export default function useWebSocket<M>(url: string, options: Options<M> = {}): Socket<M> {
  const {
    onOpen,
    onError,
    onClose,
    onMessage,
    protocols,
    manual = false,
    reconnectLimit = 3,
    reconnectInterval = 3000
  } = options;

  const isMounted = useIsMounted();
  const reconnectTimesRef = useRef(0);
  const websocketRef = useRef<WebSocket>();
  const reconnectTimerRef = useRef<NodeJS.Timeout>();
  const [message, setMessage] = useState<MessageEvent<M>>();
  const [readyState, setReadyState] = useState<number>(WebSocket.CLOSED);
  const sendQueueRef = useRef<(string | ArrayBufferLike | Blob | ArrayBufferView)[]>([]);

  /**
   * @description 重连
   */
  const reconnect = usePersistCallback(() => {
    if (reconnectTimesRef.current < reconnectLimit && websocketRef.current?.readyState !== WebSocket.OPEN) {
      clearTimeout(reconnectTimerRef.current);

      reconnectTimerRef.current = setTimeout(() => {
        connectWebSocket();

        reconnectTimesRef.current++;
      }, reconnectInterval);
    }
  });

  const connectWebSocket = usePersistCallback(() => {
    clearTimeout(reconnectTimerRef.current);

    websocketRef.current?.close();

    const connect = () => {
      const ws = new WebSocket(url, protocols);

      const getReadyState = () => ws.readyState || WebSocket.CLOSED;

      ws.onopen = event => {
        if (isMounted()) {
          reconnectTimesRef.current = 0;

          onOpen && onOpen(event);

          setReadyState(getReadyState());

          const messages = sendQueueRef.current;

          if (messages.length) {
            sendQueueRef.current = [];

            messages.forEach(send);
          }
        }
      };

      ws.onmessage = (message: MessageEvent<M>) => {
        if (isMounted()) {
          onMessage && onMessage(message);

          setMessage(message);
        }
      };

      ws.onerror = event => {
        if (isMounted()) {
          onError && onError(event);

          setReadyState(getReadyState());
        }
      };

      ws.onclose = event => {
        if (isMounted()) {
          sendQueueRef.current = [];

          onClose && onClose(event);

          setReadyState(getReadyState());

          !event.wasClean && reconnect();
        }
      };

      websocketRef.current = ws;
    };

    try {
      connect();
    } catch (error) {
      // 初始化 WebSocket 失败
      onError && onError(new Event('error'));

      __DEV__ && !onError && console.error(error);
    }
  });

  /**
   * @description 发送消息
   * @param message
   */
  const send: WebSocket['send'] = usePersistCallback(message => {
    const ws = websocketRef.current;

    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(message);
    } else {
      sendQueueRef.current.push(message);
    }
  });

  /**
   * @description 手动连接
   */
  const connect = usePersistCallback(() => {
    reconnectTimesRef.current = 0;

    connectWebSocket();
  });

  /**
   * @description 断开连接
   */
  const disconnect = usePersistCallback((code?: number, reason?: string) => {
    const ws = websocketRef.current;

    clearTimeout(reconnectTimerRef.current);

    reconnectTimesRef.current = reconnectLimit;

    ws && ws.readyState !== WebSocket.CLOSED && ws.close(code, reason);
  });

  // 初始时连接
  useEffect(() => {
    !manual && connect();
  }, [url, manual]);

  // 卸载时断开
  useEffect(() => {
    return () => disconnect();
  }, []);

  return { send, connect, message, disconnect, readyState };
}
