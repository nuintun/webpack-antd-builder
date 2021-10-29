/**
 * @module useLazyState
 */

import React, { useCallback, useRef } from 'react';

import useSafeState from './useSafeState';
import usePersistRef from './usePersistRef';
import { isFunction } from '~js/utils/utils';

/**
 * @function useLazyState
 * @description [hook] 使用延时状态，小于指定实际时不会更新状态
 * @param initialState 默认状态
 * @param delay 延迟时间
 */
export default function useLazyState<S>(
  initialState: S | (() => S),
  delay?: number
): [state: S, setLazyState: (value: React.SetStateAction<S>, immediate?: boolean) => void];
/**
 * @function useLazyState
 * @description [hook] 使用延时状态，小于指定实际时不会更新状态
 * @param initialState 默认状态
 * @param delay 延迟时间
 */
export default function useLazyState<S = undefined>(
  initialState?: S | (() => S),
  delay?: number
): [state: S | undefined, setLazyState: (value: React.SetStateAction<S | undefined>, immediate?: boolean) => void];
export default function useLazyState<S = undefined>(
  initialState?: S | (() => S),
  delay: number = 128
): [state: S | undefined, setLazyState: (value: React.SetStateAction<S | undefined>, immediate?: boolean) => void] {
  const timerRef = useRef<Timeout>();
  const delayRef = usePersistRef(delay);
  const [state, setState] = useSafeState(initialState);

  const setLazyState = useCallback((value: React.SetStateAction<S | undefined>, immediate?: boolean): void => {
    clearTimeout(timerRef.current);

    const delay = delayRef.current;
    const nextState = isFunction(value) ? value(state) : value;

    if (immediate || delay <= 0) {
      setState(nextState);
    } else {
      timerRef.current = setTimeout(() => {
        setState(nextState);
      }, delay);
    }
  }, []);

  return [state, setLazyState];
}
