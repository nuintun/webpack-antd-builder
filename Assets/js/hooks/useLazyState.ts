import React, { useRef } from 'react';

import useSafeState from './useSafeState';
import usePersistCallback from './usePersistCallback';

export default function useLazyState<S>(
  initialState: S | (() => S),
  delay: number = 128
): [state: S, setLazyState: (value: React.SetStateAction<S>, immediate?: boolean) => void] {
  const timer = useRef<Timeout>();
  const [state, setState] = useSafeState(initialState);

  const setLazyState = usePersistCallback((value: React.SetStateAction<S>, immediate?: boolean): void => {
    clearTimeout(timer.current);

    if (immediate || delay <= 0) {
      setState(value);
    } else {
      timer.current = setTimeout(() => {
        setState(value);
      }, delay);
    }
  });

  return [state, setLazyState];
}
