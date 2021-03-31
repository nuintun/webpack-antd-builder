/**
 * @module useIsMounted
 */

import { useCallback, useEffect, useRef } from 'react';

/**
 * @function useIsMounted
 * @description 【Hook】检查组件是否已经挂载
 */
export default function useIsMounted(): () => boolean {
  const mountedRef = useRef(false);
  const isMounted = useCallback(() => mountedRef.current, []);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  return isMounted;
}
