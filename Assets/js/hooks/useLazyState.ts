/**
 * @module useLazyState
 */

import React, { useRef } from 'react';

import useSafeState from './useSafeState';
import { isFunction } from '~js/utils/utils';
import usePersistCallback from './usePersistCallback';

/**
 * @function useLazyState
 * @description [hook] 使用延时状态，小于指定实际时不会更新状态
 * @param initialState 默认状态
 * @param delay 延迟时间
 */
export default function useLazyState<S>(
  initialState: S | (() => S),
  delay: number = 128
): [state: S, setLazyState: (value: React.SetStateAction<S>, immediate?: boolean) => void] {
  const timerRef = useRef<Timeout>();
  const [state, setState] = useSafeState(initialState);

  const setLazyState = usePersistCallback((value: React.SetStateAction<S>, immediate?: boolean): void => {
    clearTimeout(timerRef.current);

    const nextState = isFunction(value) ? value(state) : value;

    if (nextState !== state) {
      if (immediate || delay <= 0) {
        setState(nextState);
      } else {
        timerRef.current = setTimeout(() => {
          setState(nextState);
        }, delay);
      }
    }
  });

  return [state, setLazyState];
}
