/**
 * @module useStableCallback
 */

import { useCallback } from 'react';

import useLatestRef from './useLatestRef';

export interface Callback {
  (this: any, ...args: any[]): any;
}

/**
 * @function useStableCallback
 * @description [hook] 将指定函数包装成稳定函数
 * @param callback 回调函数
 */
export default function useStableCallback<C extends Callback>(callback: C): C {
  const callbackRef = useLatestRef(callback);

  return useCallback(((...args) => callbackRef.current(...args)) as C, []);
}
