/**
 * @module useLatestCallback
 */

import { useCallback } from 'react';
import useLatestRef from './useLatestRef';

export interface Callback {
  (this: unknown, ...args: any[]): any;
}

/**
 * @function useLatestCallback
 * @description [hook] 持久化可获取最新上下文的回调函数
 * @function useLatestCallback
 * @param callback 待处理的回调函数
 */
export default function useLatestCallback<C extends Callback>(callback: C): C {
  const callbackRef = useLatestRef(callback);

  return useCallback<Callback>(function (this, ...args) {
    return callbackRef.current.apply(this, args);
  }, []) as C;
}
