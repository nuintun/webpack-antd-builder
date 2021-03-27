import React, { useCallback, useState } from 'react';

import useIsMounted from './useIsMounted';

export default function useSafeState<S>(): [
  state: S | undefined,
  setState: React.Dispatch<React.SetStateAction<S | undefined>>
];
export default function useSafeState<S>(
  initialState: S | (() => S)
): [state: S, setState: React.Dispatch<React.SetStateAction<S>>];
export default function useSafeState<S>(
  initialState?: S | (() => S)
): [state: S | undefined, setState: React.Dispatch<React.SetStateAction<S | undefined>>] {
  const isMounted = useIsMounted();
  const [state, setState] = useState(initialState as S);

  const setSafeState = useCallback((value: React.SetStateAction<S>): void => {
    isMounted() && setState(value);
  }, []);

  return [state, setSafeState];
}
