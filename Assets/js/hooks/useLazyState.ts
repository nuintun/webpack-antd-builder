/**
 * @module useLazyState
 */

import React, { useEffect, useRef, useState } from 'react';

import useStableCallback from './useStableCallback';

/**
 * @function useLazyState
 * @description [hook] 使用延时状态，在延迟时间后更新状态
 * @param initialState 默认状态
 * @param delay 延迟时间
 */
export default function useLazyState<S>(
  initialState: S | (() => S),
  delay?: number
): [state: S, setLazyState: (value: React.SetStateAction<S>, immediate?: boolean) => void];
/**
 * @function useLazyState
 * @description [hook] 使用延时状态，在延迟时间后更新状态
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
  const [state, setState] = useState(initialState);

  const setLazyState = useStableCallback((value: React.SetStateAction<S | undefined>, immediate?: boolean): void => {
    clearTimeout(timerRef.current);

    if (immediate || delay <= 0) {
      setState(value);
    } else {
      timerRef.current = setTimeout(() => {
        setState(value);
      }, delay);
    }
  });

  useEffect(() => {
    return () => {
      clearTimeout(timerRef.current);
    };
  }, []);

  return [state, setLazyState];
}
