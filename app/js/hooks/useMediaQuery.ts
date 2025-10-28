/**
 * @module useMediaQuery
 */

import { canUseDOM } from '/js/utils/dom';
import useSafeLayoutEffect from './useSafeLayoutEffect';
import { useEffectEvent, useMemo, useState } from 'react';

/**
 * @function useMediaQuery
 * @description [hook] CSS 媒体查询
 * @param query 查询条件
 * @param onChange 查询条件触发回调
 * @param initialMatchState 默认匹配状态
 */
export default function useMediaQuery(
  query: string,
  onChange?: (matched: boolean) => void,
  initialMatchState: boolean | (() => boolean) = false
): boolean {
  const mql = useMemo(() => {
    return canUseDOM ? globalThis.matchMedia(query) : null;
  }, [query]);

  const onMatchChange = useEffectEvent((matched: boolean) => {
    onChange?.(matched);
  });

  const [matched, setState] = useState(mql ? mql.matches : initialMatchState);

  useSafeLayoutEffect(() => {
    if (mql) {
      const onMediaChange = () => {
        const matched = mql.matches;

        setState(matched);

        onMatchChange(matched);
      };

      mql.addEventListener('change', onMediaChange);

      return () => {
        mql.removeEventListener('change', onMediaChange);
      };
    }
  }, [mql]);

  return matched;
}
