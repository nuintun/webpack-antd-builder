/**
 * @module useMedia
 */

import { useMemo, useState } from 'react';

import { isBrowser } from '~js/utils/utils';
import useIsomorphicLayoutEffect from './useIsomorphicLayoutEffect';

/**
 * @function useMedia
 * @description 【Hook】CSS 媒体查询
 * @param query 查询条件
 * @param onChange 查询条件触发回调
 * @param initialState 默认状态
 */
export default function useMedia(
  query: string,
  onChange?: (matched: boolean) => void,
  initialState: boolean | (() => boolean) = false
): boolean {
  const mql = useMemo(() => (isBrowser ? window.matchMedia(query) : null), [query]);
  const [matched, setState] = useState(mql ? mql.matches : initialState);

  useIsomorphicLayoutEffect(() => {
    if (mql) {
      const onMediaChange = () => {
        const matched = mql.matches;

        setState(matched);

        onChange && onChange(matched);
      };

      mql.addEventListener('change', onMediaChange);

      return () => {
        mql.removeEventListener('change', onMediaChange);
      };
    }
  }, [mql, onChange]);

  return matched;
}
