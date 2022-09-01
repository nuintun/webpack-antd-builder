/**
 * @module useDebounce
 */

import { useMemo } from 'react';

import { debounce } from 'throttle-debounce';
import useStableCallback from './useStableCallback';

export interface Options {
  // 是否前置调用
  atBegin?: boolean;
}

/**
 * @function useDebounce
 * @description [hook] 防抖函数
 * @param callback 目标回调函数
 * @param delay 延迟的时间
 * @param options 防抖模式配置
 */
export default function useDebounce<C extends (...args: any[]) => any>(
  callback: C,
  delay: number,
  options: Options = {}
): debounce<C> {
  const { atBegin } = options;
  const fn = useStableCallback(callback);

  return useMemo(() => debounce(delay, fn, options), [delay, atBegin]);
}
