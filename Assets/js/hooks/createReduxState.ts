/**
 * @module createReduxState
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';

import { isFunction } from '~js/utils/utils';

/**
 * @function createReduxState
 * @description 【Hook】生成类 Redux 状态，支持异步
 * @param reducer 状态生成器
 */
export default function createReduxState<S, A>(
  reducer: (state: S | undefined, action: A) => S | PromiseLike<S>
): () => [state: S | undefined, dispatch: (action: A) => Promise<void>];
/**
 * @function createReduxState
 * @description 【Hook】生成类 Redux 状态，支持异步
 * @param reducer 状态生成器
 * @param initialState 初始状态
 */
export default function createReduxState<S, A>(
  reducer: (state: S, action: A) => S | PromiseLike<S>,
  initialState: S | (() => S)
): () => [state: S, dispatch: (action: A) => Promise<void>];
export default function createReduxState<S, A>(
  reducer: (state: S | undefined, action: A) => S | PromiseLike<S>,
  initialState?: S | (() => S)
): () => [state: S | undefined, dispatch: (action: A) => Promise<void>] {
  let initialized = false;

  let sharedState: S | undefined;

  const dispatches = new Set<React.Dispatch<React.SetStateAction<S | undefined>>>();

  const dispatchAction = async (action: A, initializedRef: React.MutableRefObject<boolean>): Promise<void> => {
    if (initializedRef.current) {
      const nextState = await reducer(sharedState, action);

      if (initializedRef.current) {
        sharedState = nextState;

        for (const dispatch of dispatches) {
          dispatch(sharedState);
        }
      }
    }
  };

  const getInitialState = (): S | undefined => {
    if (initialized) return sharedState;

    initialized = true;

    sharedState = isFunction(initialState) ? initialState() : initialState;

    return sharedState;
  };

  return () => {
    const initializedRef = useRef(false);
    const [state, setState] = useState(getInitialState);

    if (!initializedRef.current) {
      dispatches.add(setState);

      initializedRef.current = true;
    }

    const dispatch = useCallback((action: A): Promise<void> => {
      return dispatchAction(action, initializedRef);
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
