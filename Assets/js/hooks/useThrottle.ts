/**
 * @module useThrottle
 */

import { useMemo } from 'react';

import { throttle } from 'throttle-debounce';
import usePersistCallback from './usePersistCallback';

/**
 * @function useThrottle
 * @description 【Hook】节流函数
 * @param callback 目标回调函数
 * @param delay 延迟的时间
 * @param noTrailing 是否执行尾调用
 * @param debounceMode 是否使用防抖模式
 */
export default function useThrottle<C extends (...args: any[]) => any>(
  callback: C,
  delay: number,
  noTrailing: boolean = false,
  debounceMode: boolean = false
): throttle<C> {
  const fn = usePersistCallback(callback);

  return useMemo(() => throttle(delay, noTrailing, fn, debounceMode), [delay, noTrailing, debounceMode]);
}
