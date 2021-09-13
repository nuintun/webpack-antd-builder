/**
 * @module createReduxState
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';

import { isFunction } from '~js/utils/utils';

type Dispatch<A> = React.Dispatch<A>;

type Reducer<S, A> = React.Reducer<S, A>;

/**
 * @function createReduxState
 * @description 【Hook】生成类 Redux 状态
 * @param reducer 状态生成器
 */
export default function createReduxState<S, A>(
  reducer: Reducer<S | undefined, A>
): () => [state: S | undefined, dispatch: Dispatch<A>];
/**
 * @function createReduxState
 * @description 【Hook】生成类 Redux 状态
 * @param reducer 状态生成器
 * @param initialState 初始状态
 */
export default function createReduxState<S, A>(
  reducer: Reducer<S, A>,
  initialState: S | (() => S)
): () => [state: S, dispatch: Dispatch<A>];
export default function createReduxState<S, A>(
  reducer: Reducer<S | undefined, A>,
  initialState?: S | (() => S)
): () => [state: S | undefined, dispatch: Dispatch<A>] {
  let initialized = false;

  let sharedState: S | undefined;

  const getInitialState = (): S | undefined => {
    if (initialized) return sharedState;

    initialized = true;

    sharedState = isFunction(initialState) ? initialState() : initialState;

    return sharedState;
  };

  const dispatches = new Set<React.Dispatch<React.SetStateAction<S | undefined>>>();

  return () => {
    const initializedRef = useRef(false);
    const [state, setState] = useState(getInitialState);

    if (!initializedRef.current) {
      dispatches.add(setState);

      initializedRef.current = true;
    }

    const dispatch = useCallback<Dispatch<A>>(action => {
      if (initializedRef.current) {
        sharedState = reducer(sharedState, action);

        for (const dispatch of dispatches) {
          dispatch(sharedState);
        }
      }
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
