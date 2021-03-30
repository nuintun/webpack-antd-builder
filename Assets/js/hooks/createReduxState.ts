import React, { useCallback, useEffect, useRef, useState } from 'react';

import { isFunction } from '~js/utils/utils';

export function createReduxState<S, A>(
  reducer: (state: S, action: A) => S | PromiseLike<S>,
  initialState: S | (() => S)
): () => [state: S, dispatch: (action: A) => void] {
  let sharedState: S;

  let initialized = false;

  const dispatches = new Set<React.Dispatch<React.SetStateAction<S>>>();

  const dispatchAction = async (action: A): Promise<void> => {
    sharedState = await reducer(sharedState, action);

    dispatches.forEach(dispatch => dispatch(sharedState));
  };

  const getInitialState = (): S => {
    if (initialized) return sharedState;

    initialized = true;

    sharedState = isFunction(initialState) ? initialState() : (initialState as S);

    return sharedState;
  };

  return () => {
    const initializedRef = useRef(false);
    const [state, setState] = useState(getInitialState);

    if (!initializedRef.current) {
      dispatches.add(setState);

      initializedRef.current = true;
    }

    const dispatch = useCallback((action: A): void => {
      initializedRef.current && dispatchAction(action);
    }, []);

    useEffect(() => {
      return () => {
        dispatches.delete(setState);

        initializedRef.current = false;
      };
    }, []);

    return [state, dispatch];
  };
}
