/**
 * @module useWebSocket
 */

import useIsMounted from './useIsMounted';
import useLatestRef from './useLatestRef';
import { useCallback, useEffect, useRef } from 'react';

// 定义消息类型，与 WebSocket.send 方法参数类型一致
type Message = Parameters<WebSocket['send']>[0];

// 定义返回的 Socket 接口
interface Socket {
  connect: () => void;
  send: WebSocket['send'];
  disconnect: (code?: number, reason?: string) => void;
}

// WebSocket Hook 配置选项接口
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
 * @description 清除 WebSocket 实例上的所有事件监听器
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
 * @returns Socket 对象，包含 connect、send、disconnect 方法
 */
export default function useWebSocket<M extends Message>(url: string, options: Options<M> = {}): Socket {
  // 检查组件是否已挂载，避免在组件卸载后执行状态更新
  const isMounted = useIsMounted();
  // 使用 ref 保存最新的 URL，避免闭包问题
  const urlRef = useLatestRef(url);
  // 记录重连次数的 ref
  const reconnectTimesRef = useRef(0);
  // 使用 ref 保存最新的 options 配置
  const optionsRef = useLatestRef(options);
  // 消息发送队列，用于在连接未建立时缓存消息
  const sendQueueRef = useRef<Message[]>([]);
  // WebSocket 实例的 ref
  const websocketRef = useRef<WebSocket | null>(null);
  // 重连定时器 ref
  const reconnectTimerRef = useRef<Timeout | null>(null);

  /**
   * @description 清除重连定时器
   */
  const clearReconnectTimer = useCallback(() => {
    const reconnectTimer = reconnectTimerRef.current;

    if (reconnectTimer != null) {
      clearTimeout(reconnectTimer);
    }
  }, []);

  /**
   * @description 建立 WebSocket 连接
   */
  const connect = useCallback(() => {
    // 获取当前 WebSocket 状态
    const readyState = websocketRef.current?.readyState;

    // 如果当前状态不是 CONNECTING 或 OPEN，则创建新的 WebSocket 实例
    if (readyState !== WebSocket.CONNECTING && readyState !== WebSocket.OPEN) {
      // 清除之前的重连定时器
      clearReconnectTimer();

      // 创建 WebSocket 连接
      const createWebSocket = () => {
        const { current: options } = optionsRef;
        // 创建新的 WebSocket 实例
        const ws = new WebSocket(urlRef.current, options.protocols);

        // 连接成功事件处理
        ws.onopen = event => {
          if (isMounted()) {
            // 重置重连次数
            reconnectTimesRef.current = 0;

            // 调用用户定义的 onOpen 回调
            optionsRef.current.onOpen?.(event);

            // 发送连接前缓存的消息队列
            const messages = sendQueueRef.current;
            if (messages.length) {
              sendQueueRef.current = [];
              for (const message of messages) {
                send(message);
              }
            }
          }
        };

        // 接收消息事件处理
        ws.onmessage = (message: MessageEvent<M>): void => {
          if (isMounted()) {
            // 调用用户定义的 onMessage 回调
            optionsRef.current.onMessage?.(message);
          }
        };

        // 错误事件处理
        ws.onerror = event => {
          if (isMounted()) {
            const { onError } = optionsRef.current;

            // 调用用户定义的 onError 回调，如果没有则打印错误到控制台
            if (onError) {
              onError(event);
            } else {
              console.error(event);
            }
          }
        };

        // 关闭事件处理
        ws.onclose = event => {
          if (isMounted()) {
            // 移除所有事件监听器
            removeWsEvents(ws);

            // 清空消息队列
            sendQueueRef.current = [];

            // 清除 WebSocket 实例引用
            websocketRef.current = null;

            // 调用用户定义的 onClose 回调
            optionsRef.current.onClose?.(event);

            // 如果不是正常关闭，则尝试重连
            if (!event.wasClean) {
              reconnect();
            }
          }
        };

        // 保存 WebSocket 实例引用
        websocketRef.current = ws;
      };

      try {
        createWebSocket();
      } catch (error) {
        const { onError } = options;

        // 初始化 WebSocket 失败处理
        if (onError) {
          onError(new Event('failed to create websocket'));
        } else {
          console.error(error);
        }
      }
    }
  }, []);

  /**
   * @description 发送消息
   * @param message 要发送的消息
   */
  const send = useCallback<WebSocket['send']>(message => {
    const ws = websocketRef.current;

    // 如果连接已建立且处于 OPEN 状态，则直接发送消息
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(message);
    } else {
      // 否则将消息加入发送队列，等连接建立后再发送
      sendQueueRef.current.push(message);
    }
  }, []);

  /**
   * @description 断开 WebSocket 连接
   * @param code 关闭状态码，默认 1000（正常关闭）
   * @param reason 关闭原因
   */
  const disconnect = useCallback((code: number = 1000, reason?: string): void => {
    // 清除之前的重连定时器
    clearReconnectTimer();

    const { reconnectLimit = 3 } = optionsRef.current;

    // 设置重连次数达到上限，防止断开后自动重连
    reconnectTimesRef.current = reconnectLimit;

    // 关闭 WebSocket 连接
    websocketRef.current?.close(code, reason);
  }, []);

  const { protocols, manual } = options;

  // 初始时连接，卸载时断连
  useEffect(() => {
    // 如果不是手动连接模式，则自动连接
    if (!manual) {
      connect();
    }

    // 组件卸载时断开连接
    return () => {
      disconnect();
    };
  }, [url, protocols, manual]);

  /**
   * @description 重连机制
   */
  const reconnect = useCallback(() => {
    const { current: options } = optionsRef;
    const { reconnectLimit = 3 } = options;

    // 如果重连次数未达到上限且当前连接不是 OPEN 状态，则尝试重连
    if (reconnectTimesRef.current < reconnectLimit) {
      // 获取当前 WebSocket 状态
      const readyState = websocketRef.current?.readyState;

      // 如果当前状态不是 CONNECTING 或 OPEN，则创建新的 WebSocket 实例
      if (readyState !== WebSocket.CONNECTING && readyState !== WebSocket.OPEN) {
        // 清除之前的重连定时器
        clearReconnectTimer();

        const { reconnectInterval = 3000 } = options;

        // 设置重连定时器
        reconnectTimerRef.current = setTimeout(() => {
          connect();

          // 更新重连次数并调用用户定义的 onReconnect 回调
          const reconnectTimes = reconnectTimesRef.current++;

          optionsRef.current.onReconnect?.(reconnectTimes, reconnectLimit);
        }, reconnectInterval);
      }
    }
  }, []);

  // 返回包含操作方法的对象
  return { send, connect, disconnect };
}
