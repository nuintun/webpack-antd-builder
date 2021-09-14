/**
 * @module createSharedReducer
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';

import { isFunction } from '~js/utils/utils';

/**
 * @function createSharedReducer
 * @description 【Hook】生成共享 Reducer
 * @param reducer 状态生成器
 */
export default function createSharedReducer<S>(
  reducer: React.ReducerWithoutAction<S | undefined>
): () => [state: S | undefined, dispatch: React.DispatchWithoutAction];
/**
 * @function createSharedReducer
 * @description 【Hook】生成共享 Reducer
 * @param reducer 状态生成器
 */
export default function createSharedReducer<S, A>(
  reducer: React.Reducer<S | undefined, A>
): () => [state: S | undefined, dispatch: React.Dispatch<A>];
/**
 * @function createSharedReducer
 * @description 【Hook】生成共享 Reducer
 * @param reducer 状态生成器
 * @param initialState 初始状态
 */
export default function createSharedReducer<S>(
  reducer: React.ReducerWithoutAction<S>,
  initialState: S | (() => S)
): () => [state: S, dispatch: React.DispatchWithoutAction];
/**
 * @function createSharedReducer
 * @description 【Hook】生成共享 Reducer
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

  const getInitialState = () => {
    if (initialized) return sharedState;

    initialized = true;

    sharedState = isFunction(initialState) ? initialState() : initialState;

    return sharedState;
  };

  const dispatchActions = (action: A) => {
    sharedState = reducer(sharedState, action);

    for (const dispatch of dispatches) {
      dispatch(sharedState);
    }
  };

  const dispatches = new Set<React.Dispatch<React.SetStateAction<S | undefined>>>();

  return () => {
    const initializedRef = useRef(false);
    const [state, setState] = useState(getInitialState);

    if (!initializedRef.current) {
      dispatches.add(setState);

      initializedRef.current = true;
    }

    const dispatch = useCallback<React.Dispatch<A>>(action => {
      initializedRef.current && dispatchActions(action);
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
