/**
 * @module createSharedReducer
 */

import React, { useEffect, useState } from 'react';

import { isFunction } from '/js/utils/utils';

/**
 * @function createSharedReducer
 * @description [hook] 生成共享 Reducer
 * @param reducer 状态生成器
 */
export default function createSharedReducer<S>(
  reducer: React.ReducerWithoutAction<S | undefined>
): () => [state: S | undefined, dispatch: React.DispatchWithoutAction];
/**
 * @function createSharedReducer
 * @description [hook] 生成共享 Reducer
 * @param reducer 状态生成器
 */
export default function createSharedReducer<S, A>(
  reducer: React.Reducer<S | undefined, A>
): () => [state: S | undefined, dispatch: React.Dispatch<A>];
/**
 * @function createSharedReducer
 * @description [hook] 生成共享 Reducer
 * @param reducer 状态生成器
 * @param initialState 初始状态
 */
export default function createSharedReducer<S>(
  reducer: React.ReducerWithoutAction<S>,
  initialState: S | (() => S)
): () => [state: S, dispatch: React.DispatchWithoutAction];
/**
 * @function createSharedReducer
 * @description [hook] 生成共享 Reducer
 * @param reducer 状态生成器
 * @param initialState 初始状态
 */
export default function createSharedReducer<S, A>(
  reducer: React.Reducer<S, A>,
  initialState: S | (() => S)
): () => [state: S, dispatch: React.Dispatch<A>];
export default function createSharedReducer<S, A>(
  reducer: React.Reducer<S | undefined, A>,
  initialState?: S | (() => S)
): () => [state: S | undefined, dispatch: React.Dispatch<A>] {
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

  const dispatch = (action: A): void => {
    sharedState = reducer(sharedState, action);

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

    return [state, dispatch];
  };
}
