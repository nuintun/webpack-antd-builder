import { useMemo, useState } from 'react';

import { isBrowser } from '~js/utils/utils';
import useMountedState from './useMountedState';
import useIsomorphicLayoutEffect from './useIsomorphicLayoutEffect';

export default function useMedia(query: string, onChange?: (matched: boolean) => void, defaultState: boolean = false): boolean {
  const mql = useMemo(() => (isBrowser ? window.matchMedia(query) : null), [query]);
  const [matched, setState] = useState(mql ? mql.matches : defaultState);
  const isMounted = useMountedState();

  useIsomorphicLayoutEffect(() => {
    if (mql) {
      const onMediaChange = () => {
        if (isMounted()) {
          const matched = mql.matches;

          setState(matched);

          onChange && onChange(matched);
        }
      };

      mql.addEventListener('change', onMediaChange);

      return () => {
        mql.removeEventListener('change', onMediaChange);
      };
    }
  }, [mql, onChange]);

  return matched;
}
