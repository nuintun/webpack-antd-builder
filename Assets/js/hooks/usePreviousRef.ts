/**
 * @module usePreviousRef
 */

import React, { useEffect, useRef } from 'react';

/**
 * @function usePreviousRef
 * @description [hook] 获取上次状态引用
 * @param value 需要缓存的值
 */
export default function usePreviousRef<V>(value: V): React.MutableRefObject<V | undefined>;
/**
 * @function usePreviousRef
 * @description [hook] 获取上次状态引用
 * @param value 需要缓存的值
 * @param initialValue 初始值
 */
export default function usePreviousRef<V>(value: V, initialValue: V): React.MutableRefObject<V>;
export default function usePreviousRef<V>(value: V, initialValue?: V): React.MutableRefObject<V | undefined> {
  const valueRef = useRef(initialValue);

  useEffect(() => {
    valueRef.current = value;
  });

  return valueRef;
}
