/**
 * @module useUpdateEffect
 */

import React, { useEffect, useRef } from 'react';

/**
 * @function useUpdateEffect
 * @description [hook] 组件 useEffect 后回调
 * @param effect 回调函数
 * @param deps 回调依赖
 */
export default function useUpdateEffect(effect: React.EffectCallback, deps?: React.DependencyList): void {
  const isMountedRef = useRef(false);

  useEffect(() => {
    if (isMountedRef.current) {
      return effect();
    } else {
      isMountedRef.current = true;
    }
  }, deps);
}
