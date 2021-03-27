import React, { useEffect, useRef, useState } from 'react';

import { isFunction } from '~js/utils/utils';

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
    const initializedRef = useRef(false);
    const [state, setState] = useState(sharedState);

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
