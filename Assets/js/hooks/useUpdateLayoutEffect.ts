import React, { useRef } from 'react';

import useIsomorphicLayoutEffect from './useIsomorphicLayoutEffect';

export default function useUpdateLayoutEffect(effect: React.EffectCallback, deps?: React.DependencyList): void {
  const isMounted = useRef(false);

  useIsomorphicLayoutEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
    } else {
      return effect();
    }
  }, deps);
}
