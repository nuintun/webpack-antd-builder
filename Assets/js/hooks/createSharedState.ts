/**
 * @module createSharedState
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';

import { isFunction } from '~js/utils/utils';

/**
 * @function createSharedState
 * @description 【Hook】生成共享状态
 */
export default function createSharedState<S = undefined>(): () => [
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
export default function createSharedState<S = undefined>(
  initialState?: S | (() => S)
): () => [state: S | undefined, setState: React.Dispatch<React.SetStateAction<S | undefined>>] {
  let sharedState: S | undefined;

  let initialized = false;

  const dispatches = new Set<React.Dispatch<React.SetStateAction<S | undefined>>>();

  const dispatchState = (value: React.SetStateAction<S | undefined>): void => {
    sharedState = isFunction(value) ? value(sharedState) : value;

    for (const dispatch of dispatches) {
      dispatch(sharedState);
    }
  };

  const getInitialState = (): S | undefined => {
    if (initialized) return sharedState;

    initialized = true;

    sharedState = isFunction(initialState) ? initialState() : initialState;

    return sharedState;
  };

  return () => {
    const initializedRef = useRef(false);
    const [state, setState] = useState(getInitialState);

    if (!initializedRef.current) {
      dispatches.add(setState);

      initializedRef.current = true;
    }

    const setSharedState = useCallback((value: React.SetStateAction<S | undefined>): void => {
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
