/**
 * @module createSharedState
 */

import { isFunction } from '/js/utils/utils';
import React, { useEffect, useState } from 'react';

type State<S> = S | (() => S);

type Dispatch<S> = React.Dispatch<React.SetStateAction<S>>;

type UseSharedState<S> = () => [state: S, setSharedState: Dispatch<S>];

/**
 * @function createSharedState
 * @description [hook] 生成共享状态
 * @param initialState 初始状态
 */
export default function createSharedState<S>(initialState: State<S>): UseSharedState<S>;
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
export default function createSharedState<S = undefined>(initialState?: State<S>): UseSharedState<S | undefined> {
  let initialized = false;
  let sharedState: S | undefined;

  const dispatches = new Set<Dispatch<S | undefined>>();

  const getInitialState = (): S | undefined => {
    if (initialized) {
      return sharedState;
    }

    initialized = true;

    sharedState = isFunction(initialState) ? initialState() : initialState;

    return sharedState;
  };

  const dispatch: Dispatch<S | undefined> = value => {
    sharedState = isFunction(value) ? value(sharedState) : value;

    for (const dispatch of dispatches) {
      dispatch(sharedState);
    }
  };

  return () => {
    const [state, setState] = useState(getInitialState);

    useEffect(() => {
      dispatches.add(setState);

      return () => {
        dispatches.delete(setState);
      };
    }, []);

    return [state, dispatch];
  };
}
