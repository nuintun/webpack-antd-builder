import React, { useEffect, useState } from 'react';

import { isFunction } from '~js/utils/utils';
import useIsomorphicLayoutEffect from './useIsomorphicLayoutEffect';

interface Store<S> {
  state: S;
  setState: Setter<S>;
  setters: Setter<S>[];
}

type Setter<S> = React.Dispatch<React.SetStateAction<S>>;

export default function createSharedState<S = undefined>(): () => [state: S | undefined, setState: Setter<S | undefined>];
export default function createSharedState<S>(initialState: S | (() => S)): () => [state: S, setState: Setter<S>];
export default function createSharedState<S>(
  initialState?: S | (() => S)
): () => [state: S | undefined, setState: Setter<S | undefined>] {
  const state = isFunction(initialState) ? initialState() : (initialState as S);

  const store: Store<S> = {
    state,
    setters: [],
    setState(state: React.SetStateAction<S>): void {
      const nextState = isFunction(state) ? state(store.state) : state;

      store.state = nextState;

      store.setters.forEach(setter => setter(nextState));
    }
  };

  return () => {
    const [state, setState] = useState(store.state);

    useIsomorphicLayoutEffect(() => {
      if (!store.setters.includes(setState)) {
        store.setters.push(setState);
      }
    }, []);

    useEffect(
      () => () => {
        store.setters = store.setters.filter(setter => setter !== setState);
      },
      []
    );

    return [state, store.setState];
  };
}
