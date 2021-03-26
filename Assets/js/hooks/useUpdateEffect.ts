import React, { useEffect, useRef } from 'react';

export default function useUpdateEffect(effect: React.EffectCallback, deps?: React.DependencyList): void {
  const isMounted = useRef(false);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
    } else {
      return effect();
    }
  }, deps);
}
