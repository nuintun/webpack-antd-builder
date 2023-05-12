/**
 * @module useMedia
 */

import { useMemo, useState } from 'react';

import { canUseDOM } from '/js/utils/dom';
import useIsoLayoutEffect from './useIsoLayoutEffect';

/**
 * @function useMedia
 * @description [hook] CSS 媒体查询
 * @param query 查询条件
 * @param onChange 查询条件触发回调
 * @param initialMatchState 默认匹配状态
 */
export default function useMedia(
  query: string,
  onChange?: (matched: boolean) => void,
  initialMatchState: boolean | (() => boolean) = false
): boolean {
  const mql = useMemo(() => {
    return canUseDOM ? window.matchMedia(query) : null;
  }, [query]);

  const [matched, setState] = useState(mql ? mql.matches : initialMatchState);

  useIsoLayoutEffect(() => {
    if (mql) {
      const onMediaChange = () => {
        const matched = mql.matches;

        setState(matched);

        onChange?.(matched);
      };

      mql.addEventListener('change', onMediaChange);

      return () => {
        mql.removeEventListener('change', onMediaChange);
      };
    }
  }, [mql, onChange]);

  return matched;
}
