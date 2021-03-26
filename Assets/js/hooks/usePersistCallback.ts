import { useCallback, useRef } from 'react';

export default function usePersistCallback<C extends (...args: any[]) => any>(callback: C): C {
  const ref = useRef<C>(callback);

  ref.current = callback;

  return useCallback<C>(((...args) => ref.current(...args)) as C, []);
}
