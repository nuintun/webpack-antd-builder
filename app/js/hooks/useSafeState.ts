/**
 * @module useSafeState
 */

import useIsMounted from './useIsMounted';
import React, { useCallback, useState } from 'react';

type State<S> = S | (() => S);

type Dispatch<S> = React.Dispatch<React.SetStateAction<S>>;

type UseSafeState<S> = [state: S, setSafeState: Dispatch<S>];

/**
 * @function useSafeState
 * @description [hook] 使用安全状态
 * @param initialState 初始状态
 */
export default function useSafeState<S>(initialState: State<S>): UseSafeState<S>;
/**
 * @function useSafeState
 * @description [hook] 使用安全状态
 */
export default function useSafeState<S = undefined>(): UseSafeState<S | undefined>;
/**
 * @function useSafeState
 * @description [hook] 使用安全状态
 * @param initialState 初始状态
 */
export default function useSafeState<S = undefined>(initialState?: State<S>): UseSafeState<S | undefined> {
  const isMounted = useIsMounted();
  const [state, setState] = useState(initialState);

  const setSafeState = useCallback((value: React.SetStateAction<S | undefined>): void => {
    if (isMounted()) {
      setState(value);
    }
  }, []);

  return [state, setSafeState];
}
