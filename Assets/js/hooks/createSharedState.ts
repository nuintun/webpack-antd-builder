/**
 * @module createSharedState
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';

import { isFunction } from '~js/utils/utils';

/**
 * @function createSharedState
 * @description 【Hook】生成共享状态
 */
export default function createSharedState<S>(): () => [
  state: S | undefined,
  setState: React.Dispatch<React.SetStateAction<S | undefined>>
];
/**
 * @function createSharedState
 * @description 【Hook】生成共享状态
 * @param initialState 初始状态
 */
export default function createSharedState<S>(
  initialState: S | (() => S)
): () => [state: S, setState: React.Dispatch<React.SetStateAction<S>>];
export default function createSharedState<S>(
  initialState?: S | (() => S)
): () => [state: S | undefined, setState: React.Dispatch<React.SetStateAction<S | undefined>>] {
  let sharedState: S;

  let initialized = false;

  const dispatches = new Set<React.Dispatch<React.SetStateAction<S>>>();

  const dispatchState = (value: React.SetStateAction<S>): void => {
    sharedState = isFunction(value) ? value(sharedState) : value;

    dispatches.forEach(dispatch => dispatch(sharedState));
  };

  const getInitialState = (): S => {
    if (initialized) return sharedState;

    initialized = true;

    sharedState = isFunction(initialState) ? initialState() : (initialState as S);

    return sharedState;
  };

  return () => {
    const initializedRef = useRef(false);
    const [state, setState] = useState(getInitialState);

    if (!initializedRef.current) {
      dispatches.add(setState);

      initializedRef.current = true;
    }

    const setSharedState = useCallback((value: React.SetStateAction<S>): void => {
      initializedRef.current && dispatchState(value);
    }, []);

    useEffect(() => {
      return () => {
        dispatches.delete(setState);

        initializedRef.current = false;
      };
    }, []);

    return [state, setSharedState];
  };
}
