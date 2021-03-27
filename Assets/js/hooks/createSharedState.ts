import React, { useEffect, useState } from 'react';

import { isFunction } from '~js/utils/utils';
import useIsomorphicLayoutEffect from './useIsomorphicLayoutEffect';

type SetState<S> = React.Dispatch<React.SetStateAction<S>>;

export default function createSharedState<S>(): () => [state: S | undefined, setState: SetState<S | undefined>];
export default function createSharedState<S>(initialState: S | (() => S)): () => [state: S, setState: SetState<S>];
export default function createSharedState<S>(
  initialState?: S | (() => S)
): () => [state: S | undefined, setState: SetState<S | undefined>] {
  let dispatches = new Set<SetState<S>>();
  let sharedState = isFunction(initialState) ? initialState() : (initialState as S);

  const setSharedState = (value: React.SetStateAction<S>): void => {
    sharedState = isFunction(value) ? value(sharedState) : value;

    dispatches.forEach(dispatch => dispatch(sharedState));
  };

  return () => {
    const [state, setState] = useState(sharedState);

    useIsomorphicLayoutEffect(() => {
      dispatches.add(setState);
    }, []);

    useEffect(() => {
      return () => {
        dispatches.delete(setState);
      };
    }, []);

    return [state, setSharedState];
  };
}
