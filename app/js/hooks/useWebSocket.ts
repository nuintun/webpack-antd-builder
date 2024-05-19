/**
 * @module useWebSocket
 */

import useIsMounted from './useIsMounted';
import useLatestRef from './useLatestRef';
import { useCallback, useEffect, useRef, useState } from 'react';

interface Socket<M> {
  readyState: number;
  connect: () => void;
  send: WebSocket['send'];
  message: MessageEvent<M> | undefined;
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
  onReconnect?: (reconnectTimes: number, reconnectLimit: number) => void;
}

/**
 * @function removeWsEvents
 * @param ws WebSocket 实例
 */
function removeWsEvents(ws: WebSocket) {
  if (ws) {
    ws.onopen = null;
    ws.onmessage = null;
    ws.onerror = null;
    ws.onclose = null;
  }
}

/**
 * @function useWebSocket
 * @description [hook] 长连接 WebSocket 操作
 * @param url 链接地址
 * @param options 配置参数
 */
export default function useWebSocket<M extends string | Blob | ArrayBuffer>(url: string, options: Options<M> = {}): Socket<M> {
  const isMounted = useIsMounted();
  const urlRef = useLatestRef(url);
  const reconnectTimesRef = useRef(0);
  const optionsRef = useLatestRef(options);
  const websocketRef = useRef<WebSocket>();
  const reconnectTimerRef = useRef<Timeout>();
  const [message, setMessage] = useState<MessageEvent<M>>();
  const [readyState, setReadyState] = useState<number>(WebSocket.CLOSED);
  const sendQueueRef = useRef<(string | ArrayBufferLike | Blob | ArrayBufferView)[]>([]);

  /**
   * @description 重连
   */
  const reconnect = useCallback(() => {
    const { current: options } = optionsRef;
    const { reconnectLimit = 3 } = options;

    if (reconnectTimesRef.current < reconnectLimit && websocketRef.current?.readyState !== WebSocket.OPEN) {
      clearTimeout(reconnectTimerRef.current);

      const { reconnectInterval = 3000 } = options;

      reconnectTimerRef.current = setTimeout(() => {
        connectWebSocket();

        const reconnectTimes = reconnectTimesRef.current++;

        optionsRef.current.onReconnect?.(reconnectTimes, reconnectLimit);
      }, reconnectInterval);
    }
  }, []);

  const connectWebSocket = useCallback(() => {
    clearTimeout(reconnectTimerRef.current);

    websocketRef.current?.close(1000);

    const connect = () => {
      const { current: options } = optionsRef;
      const ws = new WebSocket(urlRef.current, options.protocols);
      const getReadyState = () => ws.readyState || WebSocket.CLOSED;

      ws.onopen = event => {
        if (isMounted()) {
          setReadyState(getReadyState);

          reconnectTimesRef.current = 0;

          optionsRef.current.onOpen?.(event);

          const messages = sendQueueRef.current;

          if (messages.length) {
            sendQueueRef.current = [];

            for (const message of messages) {
              send(message);
            }
          }
        }
      };

      ws.onmessage = (message: MessageEvent<M>): void => {
        if (isMounted()) {
          setMessage(message);

          optionsRef.current.onMessage?.(message);
        }
      };

      ws.onerror = event => {
        if (isMounted()) {
          setReadyState(getReadyState);

          const { onError } = optionsRef.current;

          if (onError) {
            onError(event);
          } else {
            console.error(event);
          }
        }
      };

      ws.onclose = event => {
        if (isMounted()) {
          removeWsEvents(ws);

          sendQueueRef.current = [];

          setReadyState(getReadyState);

          optionsRef.current.onClose?.(event);

          if (!event.wasClean) {
            reconnect();
          }
        }
      };

      websocketRef.current = ws;
    };

    try {
      connect();
    } catch (error) {
      const { onError } = options;

      // 初始化 WebSocket 失败
      if (onError) {
        onError(new Event('Failed to connect'));
      } else {
        console.error(error);
      }
    }
  }, []);

  /**
   * @description 发送消息
   * @param message
   */
  const send = useCallback<WebSocket['send']>(message => {
    const ws = websocketRef.current;

    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(message);
    } else {
      sendQueueRef.current.push(message);
    }
  }, []);

  /**
   * @description 手动连接
   */
  const connect = useCallback(() => {
    reconnectTimesRef.current = 0;

    connectWebSocket();
  }, []);

  /**
   * @description 断开连接
   */
  const disconnect = useCallback((code: number = 1000, reason?: string): void => {
    const { reconnectLimit = 3 } = optionsRef.current;

    clearTimeout(reconnectTimerRef.current);

    reconnectTimesRef.current = reconnectLimit;

    websocketRef.current?.close(code, reason);
  }, []);

  const { protocols, manual } = options;

  // 初始时连接，卸载时断连
  useEffect(() => {
    if (!manual) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [url, protocols, manual]);

  return { send, connect, message, disconnect, readyState };
}
