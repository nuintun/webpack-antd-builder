/**
 * @module useUpdateLayoutEffect
 */

import React, { useRef } from 'react';

import useIsoLayoutEffect from './useIsoLayoutEffect';

/**
 * @function useUpdateLayoutEffect
 * @description [hook] 组件 useLayoutEffect 后回调，SSR 会在 useEffect 后回调
 * @param effect 回调函数
 * @param deps 回调依赖
 */
export default function useUpdateLayoutEffect(effect: React.EffectCallback, deps?: React.DependencyList): void {
  const isMountedRef = useRef(false);

  useIsoLayoutEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true;
    } else {
      return effect();
    }
  }, deps);
}
