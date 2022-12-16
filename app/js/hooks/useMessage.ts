/**
 * @module useMessage
 */

import { createContext, useContext, useMemo } from 'react';

import { message } from 'antd';
import useLatestRef from './useLatestRef';

export type Message = ReturnType<typeof message.useMessage>[0];

const MessageContext = createContext<Message>(message);

export const Provider = MessageContext.Provider;

/**
 * @function useMessage
 * @description [hook] 使用消息提示
 */
export default function useMessage(): Message {
  const messageRef = useLatestRef(useContext(MessageContext));

  return useMemo<Message>(() => {
    return {
      info(...args) {
        return messageRef.current.info(...args);
      },
      success(...args) {
        return messageRef.current.info(...args);
      },
      error(...args) {
        return messageRef.current.info(...args);
      },
      warning(...args) {
        return messageRef.current.info(...args);
      },
      loading(...args) {
        return messageRef.current.info(...args);
      },
      open(...args) {
        return messageRef.current.info(...args);
      },
      destroy(...args) {
        return messageRef.current.info(...args);
      }
    };
  }, []);
}
