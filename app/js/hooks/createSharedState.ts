/**
 * @module createSharedState
 */

import React, { useEffect, useState } from 'react';

import { isFunction } from '/js/utils/utils';

type SetSharedState<S> = React.Dispatch<React.SetStateAction<S>>;

type UseSharedState<S> = () => [state: S, setState: SetSharedState<S>];

/**
 * @function createSharedState
 * @description [hook] 生成共享状态
 */
export default function createSharedState<S = undefined>(): UseSharedState<S | undefined>;
/**
 * @function createSharedState
 * @description [hook] 生成共享状态
 * @param initialState 初始状态
 */
export default function createSharedState<S>(initialState: S | (() => S)): UseSharedState<S>;
export default function createSharedState<S = undefined>(initialState?: S | (() => S)): UseSharedState<S | undefined> {
  let initialized = false;
  let sharedState: S | undefined;

  const getInitialState = (): S | undefined => {
    if (initialized) {
      return sharedState;
    }

    initialized = true;

    sharedState = isFunction(initialState) ? initialState() : initialState;

    return sharedState;
  };

  const setSharedState = (value: React.SetStateAction<S | undefined>): void => {
    sharedState = isFunction(value) ? value(sharedState) : value;

    for (const dispatch of dispatches) {
      dispatch(sharedState);
    }
  };

  const dispatches = new Set<React.Dispatch<React.SetStateAction<S | undefined>>>();

  return () => {
    const [state, setState] = useState(getInitialState);

    useEffect(() => {
      dispatches.add(setState);

      return () => {
        dispatches.delete(setState);
      };
    }, []);

    return [state, setSharedState];
  };
}
