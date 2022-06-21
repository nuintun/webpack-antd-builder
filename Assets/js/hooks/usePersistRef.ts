/**
 * @module usePersistRef
 */

import React, { useRef } from 'react';

/**
 * @function usePersistRef
 * @description 生成自更新 useRef 对象
 */
export default function usePersistRef<T = undefined>(): React.MutableRefObject<T | undefined>;
/**
 * @function usePersistRef
 * @description 生成自更新 useRef 对象
 * @param value 引用值
 */
export default function usePersistRef<T>(value: T): React.MutableRefObject<T>;
export default function usePersistRef<T = undefined>(value?: T): React.MutableRefObject<T | undefined> {
  const valueRef = useRef(value);

  valueRef.current = value;

  return valueRef;
}
