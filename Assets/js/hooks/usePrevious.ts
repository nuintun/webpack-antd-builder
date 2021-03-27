import { useEffect, useRef } from 'react';

export default function usePrevious<V>(value: V): V | undefined;
export default function usePrevious<V>(value: V, initialValue: V): V;
export default function usePrevious<V>(value: V, initialValue?: V): V | undefined {
  const ref = useRef<V>(initialValue as V);

  useEffect(() => {
    ref.current = value;
  });

  return ref.current;
}
