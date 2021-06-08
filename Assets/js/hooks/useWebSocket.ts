/**
 * @module useWebSocket
 */

import { useCallback, useEffect, useRef, useState } from 'react';

import usePersistCallback from './usePersistCallback';

interface Socket<M> {
  readyState: number;
  connect: () => void;
  send: WebSocket['send'];
  message: MessageEvent<M | null>;
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

function initialMessage(url: string): MessageEvent<null> {
  return new MessageEvent('message', { origin: new URL(url).origin });
}

/**
 * @function useWebSocket
 * @description 【Hook】长连接 WebSocket 操作
 * @param url 链接地址
 * @param options 配置参数
 */
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

  const reconnectTimesRef = useRef(0);
  const websocketRef = useRef<WebSocket>();
  const reconnectTimerRef = useRef<NodeJS.Timeout>();
  const [readyState, setReadyState] = useState<number>(WebSocket.CLOSED);
  const onUnload = useCallback(() => websocketRef.current?.close(1000), []);
  const sendQueueRef = useRef<(string | ArrayBufferLike | Blob | ArrayBufferView)[]>([]);
  const [message, setMessage] = useState<MessageEvent<M | null>>(() => initialMessage(url));

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

    websocketRef.current?.close(1000);

    const connect = () => {
      const ws = new WebSocket(url, protocols);

      const getReadyState = () => ws.readyState || WebSocket.CLOSED;

      ws.onopen = event => {
        reconnectTimesRef.current = 0;

        onOpen && onOpen(event);

        setReadyState(getReadyState());

        const messages = sendQueueRef.current;

        if (messages.length) {
          sendQueueRef.current = [];

          messages.forEach(send);
        }
      };

      ws.onmessage = (message: MessageEvent<M>) => {
        onMessage && onMessage(message);

        setMessage(message);
      };

      ws.onerror = event => {
        onError && onError(event);

        setReadyState(getReadyState());
      };

      ws.onclose = event => {
        ws.onopen = null;
        ws.onmessage = null;
        ws.onerror = null;
        ws.onclose = null;
        sendQueueRef.current = [];

        onClose && onClose(event);

        setReadyState(getReadyState());

        !event.wasClean && reconnect();
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
    clearTimeout(reconnectTimerRef.current);

    reconnectTimesRef.current = reconnectLimit;

    websocketRef.current?.close(code, reason);
  });

  // 初始时连接
  useEffect(() => {
    !manual && connect();
  }, [url, protocols, manual]);

  // 卸载时断开
  useEffect(() => {
    window.addEventListener('unload', onUnload, false);

    return () => {
      window.removeEventListener('unload', onUnload, false);

      disconnect();
    };
  }, []);

  return { send, connect, message, disconnect, readyState };
}
