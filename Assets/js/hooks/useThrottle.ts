/**
 * @module useThrottle
 */

import { useMemo } from 'react';

import { throttle } from 'throttle-debounce';
import usePersistCallback from './usePersistCallback';

export interface Options {
  // 是否使用首调用模式
  noLeading?: boolean;
  // 是否使用尾调用模式
  noTrailing?: boolean;
  // 是否使用防抖模式
  debounceMode?: boolean;
}

/**
 * @function useThrottle
 * @description [hook] 节流函数
 * @param callback 目标回调函数
 * @param delay 间隔的时间
 * @param options 节流模式配置
 */
export default function useThrottle<C extends (...args: any[]) => any>(
  callback: C,
  delay: number,
  options: Options = {}
): throttle<C> {
  const fn = usePersistCallback(callback);
  const { noLeading, noTrailing, debounceMode } = options;

  return useMemo(() => throttle(delay, fn, options), [delay, noLeading, noTrailing, debounceMode]);
}
