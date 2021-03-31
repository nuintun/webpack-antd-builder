/**
 * @module usePrevious
 */

import { useEffect, useRef } from 'react';

/**
 * @function usePrevious
 * @description 【Hook】获取上次状态值
 * @param value 需要缓存的值
 */
export default function usePrevious<V>(value: V): V | undefined;
/**
 * @function usePrevious
 * @description 【Hook】获取上次状态值
 * @param value 需要缓存的值
 * @param initialValue 初始值
 */
export default function usePrevious<V>(value: V, initialValue: V): V;
export default function usePrevious<V>(value: V, initialValue?: V): V | undefined {
  const valueRef = useRef(initialValue as V);

  useEffect(() => {
    valueRef.current = value;
  });

  return valueRef.current;
}
