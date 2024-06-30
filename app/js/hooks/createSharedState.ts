/**
 * @module createSharedState
 */

import { StateStore } from '/js/utils/StateStore';
import React, { useSyncExternalStore } from 'react';

type Dispatch<S> = React.Dispatch<React.SetStateAction<S>>;

type UseSharedState<S> = () => [state: S, dispatch: Dispatch<S>];

/**
 * @function createSharedState
 * @description [hook] 生成共享状态
 * @param initialState 初始状态
 */
export default function createSharedState<S>(initialState: S): UseSharedState<S>;
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
export default function createSharedState<S = undefined>(initialState?: S): UseSharedState<S | undefined> {
  const store = new StateStore(initialState);
  const dispatch = store.dispatch.bind(store);
  const subscribe = store.subscribe.bind(store);
  const getSnapshot = store.getSnapshot.bind(store);

  return () => {
    return [useSyncExternalStore(subscribe, getSnapshot), dispatch];
  };
}
