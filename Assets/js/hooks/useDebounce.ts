/**
 * @module useDebounce
 */

import { useMemo } from 'react';

import { debounce } from 'throttle-debounce';
import usePersistCallback from './usePersistCallback';

/**
 * @function useDebounce
 * @description 【Hook】去抖函数
 * @param callback 目标回调函数
 * @param delay 延迟的时间
 * @param atBegin 是否前置调用
 */
export default function useDebounce<C extends (...args: any[]) => any>(
  callback: C,
  delay: number = 120,
  atBegin: boolean = false
): debounce<C> {
  const fn = usePersistCallback(callback);

  return useMemo(() => debounce(delay, atBegin, fn), [delay, atBegin]);
}
