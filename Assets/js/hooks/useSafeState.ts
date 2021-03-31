/**
 * @module useSafeState
 */

import React, { useCallback, useState } from 'react';

import useIsMounted from './useIsMounted';

/**
 * @function useSafeState
 * @description 【Hook】使用安全状态
 */
export default function useSafeState<S>(): [
  state: S | undefined,
  setState: React.Dispatch<React.SetStateAction<S | undefined>>
];
/**
 * @function useSafeState
 * @description 【Hook】使用安全状态
 * @param initialState 初始状态
 */
export default function useSafeState<S>(
  initialState: S | (() => S)
): [state: S, setState: React.Dispatch<React.SetStateAction<S>>];
export default function useSafeState<S>(
  initialState?: S | (() => S)
): [state: S | undefined, setState: React.Dispatch<React.SetStateAction<S | undefined>>] {
  const isMounted = useIsMounted();
  const [state, setState] = useState(initialState as S);

  const setSafeState = useCallback((value: React.SetStateAction<S>): void => {
    isMounted() && setState(value);
  }, []);

  return [state, setSafeState];
}
