import React, { createContext, createElement, useContext, useMemo, useReducer } from 'react';

import useIsMounted from './useIsMounted';

type ReducerProvider = React.FunctionComponent<{}>;

type ReducerContext<R extends React.Reducer<any, any>> = [
  state: React.ReducerState<R>,
  dispatch: React.Dispatch<React.ReducerAction<R>>
];

type InternalContext<R extends React.Reducer<any, any>> = [isMounted: () => boolean, ReducerContext?: ReducerContext<R>];

export default function createReducerContext<R extends React.Reducer<any, any>>(
  reducer: R,
  initialState: React.ReducerState<R>
): [useReducerContext: () => ReducerContext<R>, ReducerProvider: ReducerProvider] {
  const context = createContext<InternalContext<R>>([() => false]);

  const useReducerContext = (): ReducerContext<R> | never => {
    const [isMounted, state] = useContext(context);

    if (isMounted()) return state as React.ReducerState<R>;

    throw new Error(`useReducerContext must be used inside a ReducerProvider`);
  };

  const ReducerProvider: ReducerProvider = ({ children }) => {
    const isMounted = useIsMounted();
    const [state, dispatch] = useReducer(reducer, initialState);
    const value = useMemo<InternalContext<R>>(() => [isMounted, [state, dispatch]], [state]);

    return createElement(context.Provider, { value }, children);
  };

  return [useReducerContext, ReducerProvider];
}
