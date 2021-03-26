import React, { createContext, createElement, useContext, useState } from 'react';

type StateProvider = React.FunctionComponent<{}>;

type StateContext<S> = [state: S, setState: React.Dispatch<React.SetStateAction<S>>];

type InternalContext<S> = StateContext<S> | undefined;

export default function createStateContext<S>(
  initialState: S | (() => S)
): [useStateContext: () => StateContext<S>, StateProvider: StateProvider] {
  const context = createContext<InternalContext<S>>(undefined);

  const useStateContext = (): StateContext<S> | never => {
    const state = useContext(context);

    if (state !== undefined) return state;

    throw new Error(`useStateContext must be used inside a StateProvider`);
  };

  const StateProvider: StateProvider = ({ children }) => {
    const state = useState(initialState);

    return createElement(context.Provider, { value: state }, children);
  };

  return [useStateContext, StateProvider];
}
