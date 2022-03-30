/**
 * @module createSharedState
 */

import React, { useCallback, useEffect, useState } from 'react';

import { isFunction } from '/js/utils/utils';

/**
 * @function createSharedState
 * @description [hook] 生成共享状态
 */
export default function createSharedState<S = undefined>(): () => [
  state: S | undefined,
  setState: React.Dispatch<React.SetStateAction<S | undefined>>
];
/**
 * @function createSharedState
 * @description [hook] 生成共享状态
 * @param initialState 初始状态
 */
export default function createSharedState<S>(
  initialState: S | (() => S)
): () => [state: S, setState: React.Dispatch<React.SetStateAction<S>>];
export default function createSharedState<S = undefined>(
  initialState?: S | (() => S)
): () => [state: S | undefined, setState: React.Dispatch<React.SetStateAction<S | undefined>>] {
  let initialized = false;
  let sharedState: S | undefined;

  const getInitialState = (): S | undefined => {
    if (initialized) return sharedState;

    initialized = true;

    sharedState = isFunction(initialState) ? initialState() : initialState;

    return sharedState;
  };

  const dispatchActions = (value: React.SetStateAction<S | undefined>): void => {
    sharedState = isFunction(value) ? value(sharedState) : value;

    for (const dispatch of dispatches) {
      dispatch(sharedState);
    }
  };

  const dispatches = new Set<React.Dispatch<React.SetStateAction<S | undefined>>>();

  return () => {
    const [state, setState] = useState(getInitialState);

    const setSharedState = useCallback((value: React.SetStateAction<S | undefined>): void => {
      dispatchActions(value);
    }, []);

    useEffect(() => {
      dispatches.add(setState);

      return () => {
        dispatches.delete(setState);
      };
    }, []);

    return [state, setSharedState];
  };
}
