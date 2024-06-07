/**
 * @module useDebounce
 */

import { useMemo } from 'react';
import useLatestRef from './useLatestRef';
import { debounce } from 'throttle-debounce';

export interface Options {
  // 是否前置调用
  atBegin?: boolean;
}

export interface Callback {
  (this: any, ...args: any[]): any;
}

/**
 * @function useDebounce
 * @description [hook] 防抖函数
 * @param callback 目标回调函数
 * @param delay 延迟的时间
 * @param options 防抖模式配置
 */
export default function useDebounce<C extends Callback>(callback: C, delay: number, options: Options = {}): debounce<C> {
  const { atBegin } = options;

  const callbackRef = useLatestRef(callback);

  return useMemo(() => {
    const callback: Callback = (...args) => {
      return callbackRef.current(...args);
    };

    return debounce(delay, callback, { atBegin });
  }, [delay, atBegin]);
}
