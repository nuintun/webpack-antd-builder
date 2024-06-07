/**
 * @module useThrottle
 */

import { useMemo } from 'react';
import useLatestRef from './useLatestRef';
import { throttle } from 'throttle-debounce';

export interface Options {
  // 是否使用首调用模式
  noLeading?: boolean;
  // 是否使用尾调用模式
  noTrailing?: boolean;
  // 是否使用防抖模式
  debounceMode?: boolean;
}

export interface Callback {
  (this: any, ...args: any[]): any;
}

/**
 * @function useThrottle
 * @description [hook] 节流函数
 * @param callback 目标回调函数
 * @param delay 间隔的时间
 * @param options 节流模式配置
 */
export default function useThrottle<C extends Callback>(callback: C, delay: number, options: Options = {}): throttle<C> {
  const { noLeading, noTrailing, debounceMode } = options;

  const callbackRef = useLatestRef(callback);

  return useMemo(() => {
    const callback: Callback = (...args) => {
      return callbackRef.current(...args);
    };

    return throttle(delay, callback, { noLeading, noTrailing, debounceMode });
  }, [delay, noLeading, noTrailing, debounceMode]);
}
