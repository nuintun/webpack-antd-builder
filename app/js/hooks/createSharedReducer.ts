/**
 * @module createSharedReducer
 */

import { StateStore } from '/js/utils/StateStore';
import React, { useSyncExternalStore } from 'react';

/**
 * @function createSharedReducer
 * @description [hook] 生成共享 Reducer
 * @param reducer 状态生成器
 * @param initialState 初始状态
 */
export default function createSharedReducer<S>(
  reducer: React.ReducerWithoutAction<S>,
  initialState: S
): () => [state: S, dispatch: React.DispatchWithoutAction];
/**
 * @function createSharedReducer
 * @description [hook] 生成共享 Reducer
 * @param reducer 状态生成器
 * @param initialState 初始状态
 */
export default function createSharedReducer<S, A>(
  reducer: React.Reducer<S, A>,
  initialState: S
): () => [state: S, dispatch: React.Dispatch<A>];
/**
 * @function createSharedReducer
 * @description [hook] 生成共享 Reducer
 * @param reducer 状态生成器
 */
export default function createSharedReducer<S = undefined>(
  reducer: React.ReducerWithoutAction<S | undefined>
): () => [state: S | undefined, dispatch: React.DispatchWithoutAction];
/**
 * @function createSharedReducer
 * @description [hook] 生成共享 Reducer
 * @param reducer 状态生成器
 */
export default function createSharedReducer<S = undefined, A = unknown>(
  reducer: React.Reducer<S | undefined, A>
): () => [state: S | undefined, dispatch: React.Dispatch<A>];
/**
 * @function createSharedReducer
 * @description [hook] 生成共享 Reducer
 * @param reducer 状态生成器
 * @param initialState 初始状态
 */
export default function createSharedReducer<S = undefined, A = unknown>(
  reducer: React.Reducer<S | undefined, A> | React.ReducerWithoutAction<S | undefined>,
  initialState?: S
): () => [state: S | undefined, dispatch: React.Dispatch<A> | React.DispatchWithoutAction] {
  const store = new StateStore(initialState);
  const subscribe = store.subscribe.bind(store);
  const getSnapshot = store.getState.bind(store);

  const dispatch: React.Dispatch<A> | React.DispatchWithoutAction = action => {
    store.dispatch(state => {
      return reducer(state, action);
    });
  };

  return () => {
    return [useSyncExternalStore(subscribe, getSnapshot), dispatch];
  };
}
