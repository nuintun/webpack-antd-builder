/**
 * @module useLazyState
 */

import useLatestRef from './useLatestRef';
import React, { useCallback, useEffect, useRef, useState } from 'react';

/**
 * @function clearTimerRef
 * @description 清理延时器
 * @param timerRef 延时器引用
 */
function clearTimerRef(timerRef: React.MutableRefObject<Timeout | null>): void {
  const { current: timer } = timerRef;

  if (timer != null) {
    clearTimeout(timer);

    timerRef.current = null;
  }
}

/**
 * @function useLazyState
 * @description [hook] 使用延时状态，在延迟时间后更新状态
 * @param initialState 默认状态
 * @param delay 延迟时间
 */
export default function useLazyState<S>(
  initialState: S | (() => S),
  delay?: number
): [state: S, setLazyState: (value: React.SetStateAction<S>, delay?: number) => void];
/**
 * @function useLazyState
 * @description [hook] 使用延时状态，在延迟时间后更新状态
 * @param initialState 默认状态
 * @param delay 延迟时间
 */
export default function useLazyState<S = undefined>(
  initialState?: S | (() => S),
  delay?: number
): [state: S | undefined, setLazyState: (value: React.SetStateAction<S | undefined>, delay?: number) => void];
export default function useLazyState<S = undefined>(
  initialState?: S | (() => S),
  delay: number = 128
): [state: S | undefined, setLazyState: (value: React.SetStateAction<S | undefined>, delay?: number) => void] {
  const delayRef = useLatestRef(delay);
  const timerRef = useRef<Timeout | null>(null);
  const [state, setState] = useState(initialState);

  const setLazyState = useCallback((value: React.SetStateAction<S | undefined>, delay: number = delayRef.current): void => {
    clearTimerRef(timerRef);

    if (delay <= 0) {
      setState(value);
    } else {
      timerRef.current = setTimeout(() => {
        if (timerRef.current != null) {
          setState(value);

          timerRef.current = null;
        }
      }, delay);
    }
  }, []);

  useEffect(() => {
    return () => {
      clearTimerRef(timerRef);
    };
  }, []);

  return [state, setLazyState];
}
