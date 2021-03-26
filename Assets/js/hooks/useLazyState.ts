import React, { useRef, useState } from 'react';

import useMountedState from './useMountedState';
import usePersistCallback from './usePersistCallback';

export default function useLazyState<S>(
  initialState: S,
  delay: number = 128
): [state: S, setLazyState: (value: React.SetStateAction<S>, immediate?: boolean) => void] {
  const isMounted = useMountedState();
  const timer = useRef<NodeJS.Timeout>();
  const [state, setState] = useState(initialState);
  const setLazyState = usePersistCallback((value: React.SetStateAction<S>, immediate?: boolean) => {
    clearTimeout(timer.current);

    if (immediate || delay <= 0) {
      isMounted() && setState(value);
    } else {
      timer.current = setTimeout(() => {
        isMounted() && setState(value);
      }, delay);
    }
  });

  return [state, setLazyState];
}
