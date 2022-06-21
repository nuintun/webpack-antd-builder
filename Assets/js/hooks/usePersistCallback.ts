/**
 * @module usePersistCallback
 */

import { useCallback, useRef } from 'react';

/**
 * @function usePersistCallback
 * @description [hook] 将指定函数包装成稳定函数
 * @param callback 回调函数
 */
export default function usePersistCallback<C extends (...args: any[]) => any>(callback: C): C {
  const callbackRef = useRef(callback);

  if (callbackRef.current !== callback) {
    callbackRef.current = callback;
  }

  return useCallback(((...args) => callbackRef.current(...args)) as C, []);
}
