/**
 * @module useLatestRef
 */

import React, { useMemo, useRef } from 'react';

/**
 * @function useLatestRef
 * @description 生成自更新 useRef 对象
 */
export default function useLatestRef<T = undefined>(): React.MutableRefObject<T | undefined>;
/**
 * @function useLatestRef
 * @description 生成自更新 useRef 对象
 * @param value 引用值
 */
export default function useLatestRef<T>(value: T): React.MutableRefObject<T>;
export default function useLatestRef<T = undefined>(value?: T): React.MutableRefObject<T | undefined> {
  const valueRef = useRef(value);

  // HACK 官方类型定义有问题，后期检查有无更新
  // https://github.com/alibaba/hooks/issues/728
  valueRef.current = useMemo((() => value) as any, [value]);

  return valueRef;
}
