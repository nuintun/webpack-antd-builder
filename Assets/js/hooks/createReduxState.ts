/**
 * @module createReduxState
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';

import { isFunction } from '~js/utils/utils';

type Dispatch<A> = (action: A) => Promise<void>;

type Reducer<S, A> = (state: S, action: A) => S | PromiseLike<S>;

/**
 * @function createReduxState
 * @description 【Hook】生成类 Redux 状态，支持异步
 * @param reducer 状态生成器
 */
export default function createReduxState<S, A>(
  reducer: Reducer<S | undefined, A>
): () => [state: S | undefined, dispatch: Dispatch<A>];
/**
 * @function createReduxState
 * @description 【Hook】生成类 Redux 状态，支持异步
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
