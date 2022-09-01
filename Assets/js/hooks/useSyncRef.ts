/**
 * @module useSyncRef
 */

import React, { useRef } from 'react';

/**
 * @function useSyncRef
 * @description 生成自更新 useRef 对象
 */
export default function useSyncRef<T = undefined>(): React.MutableRefObject<T | undefined>;
/**
 * @function useSyncRef
 * @description 生成自更新 useRef 对象
 * @param value 引用值
 */
export default function useSyncRef<T>(value: T): React.MutableRefObject<T>;
export default function useSyncRef<T = undefined>(value?: T): React.MutableRefObject<T | undefined> {
  const valueRef = useRef(value);

  valueRef.current = value;

  return valueRef;
}
