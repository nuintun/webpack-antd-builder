/**
 * @module usePersistCallback
 */

import { useCallback, useRef } from 'react';

/**
 * @function usePersistCallback
 * @description 【Hook】将指定函数包装成稳定函数
 * @param callback 回调函数
 */
export default function usePersistCallback<C extends (...args: any[]) => any>(callback: C): C {
  const ref = useRef(callback);

  ref.current = callback;

  return useCallback(((...args) => ref.current(...args)) as C, []);
}
