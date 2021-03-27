import React, { useEffect, useRef } from 'react';

import useSafeState from './useSafeState';
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
  let dispatches = new Set<React.Dispatch<React.SetStateAction<S>>>();
  let sharedState = isFunction(initialState) ? initialState() : (initialState as S);

  const setSharedState = (value: React.SetStateAction<S>): void => {
    sharedState = isFunction(value) ? value(sharedState) : value;

    dispatches.forEach(dispatch => dispatch(sharedState));
  };

  return () => {
    const initializedRef = useRef(false);
    const [state, setState] = useSafeState(sharedState);

    if (!initializedRef.current) {
      dispatches.add(setState);

      initializedRef.current = true;
    }

    useEffect(() => {
      return () => {
        dispatches.delete(setState);
      };
    }, []);

    return [state, setSharedState];
  };
}
