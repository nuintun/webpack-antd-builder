/**
 * @module useIsMounted
 */

import { useCallback, useEffect, useRef } from 'react';

/**
 * @function useIsMounted
 * @description [hook] 检查组件是否已经挂载
 */
export default function useIsMounted(): () => boolean {
  const isMountedRef = useRef(false);
  const isMounted = useCallback(() => isMountedRef.current, []);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return isMounted;
}
