import React, { useCallback, useEffect, useRef, useState } from 'react';

import { isFunction } from '~js/utils/utils';

export default function createSharedState<S>(): () => [
  state: S | undefined,
  setState: React.Dispatch<React.SetStateAction<S | undefined>>
];
export default function createSharedState<S>(
  initialState: S | (() => S)
): () => [state: S, setState: React.Dispatch<React.SetStateAction<S>>];
export default function createSharedState<S>(
  initialState?: S | (() => S)
): () => [state: S | undefined, setState: React.Dispatch<React.SetStateAction<S | undefined>>] {
  let sharedState = isFunction(initialState) ? initialState() : (initialState as S);

  const dispatches = new Set<React.Dispatch<React.SetStateAction<S>>>();

  const dispatchState = (value: React.SetStateAction<S>): void => {
    sharedState = isFunction(value) ? value(sharedState) : value;

    dispatches.forEach(dispatch => dispatch(sharedState));
  };

  return () => {
    const initializedRef = useRef(false);
    const [state, setState] = useState(sharedState);

    if (!initializedRef.current) {
      dispatches.add(setState);

      initializedRef.current = true;
    }

    const setSharedState = useCallback((value: React.SetStateAction<S>): void => {
      dispatches.has(setState) && dispatchState(value);
    }, []);

    useEffect(() => {
      return () => {
        dispatches.delete(setState);
      };
    }, []);

    return [state, setSharedState];
  };
}
