/**
 * @module usePrevious
 */

import usePreviousRef from './usePreviousRef';

/**
 * @function usePrevious
 * @description [hook] 获取上次状态值
 * @param value 需要缓存的值
 */
export default function usePrevious<V>(value: V): V | undefined;
/**
 * @function usePrevious
 * @description [hook] 获取上次状态值
 * @param value 需要缓存的值
 * @param initialValue 初始值
 */
export default function usePrevious<V>(value: V, initialValue: V): V;
export default function usePrevious<V>(value: V, initialValue?: V): V | undefined {
  return usePreviousRef(value, initialValue).current;
}
