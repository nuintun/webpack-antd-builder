import React, { useCallback, useState } from 'react';

import useIsMounted from './useIsMounted';

export default function useSafeState<S>(): [S | undefined, React.Dispatch<React.SetStateAction<S | undefined>>];
export default function useSafeState<S>(initialState: S | (() => S)): [S, React.Dispatch<React.SetStateAction<S>>];
export default function useSafeState<S>(initialState?: S | (() => S)): [S, React.Dispatch<React.SetStateAction<S>>] {
  const isMounted = useIsMounted();
  const [state, setState] = useState(initialState as S);

  const setSafeState = useCallback((value: React.SetStateAction<S>): void => {
    isMounted() && setState(value);
  }, []);

  return [state, setSafeState];
}
