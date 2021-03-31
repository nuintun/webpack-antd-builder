/**
 * @module useLazyState
 */

import React, { useRef } from 'react';

import useSafeState from './useSafeState';
import usePersistCallback from './usePersistCallback';

/**
 * @function useLazyState
 * @description 【Hook】使用延时状态，小于指定实际时不会更新状态
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

    if (immediate || delay <= 0) {
      setState(value);
    } else {
      timerRef.current = setTimeout(() => {
        setState(value);
      }, delay);
    }
  });

  return [state, setLazyState];
}
