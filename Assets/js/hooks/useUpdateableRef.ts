/**
 * @module useUpdateableRef
 */

import { useCallback, useRef } from 'react';

type UpdateRef<T> = (value: T) => T;

type Guard<T> = (value: T, prevValue: T) => boolean;

const defaultGuard = () => true;

export default function useUpdateableRef<T = undefined>(): UpdateRef<T | undefined>;
export default function useUpdateableRef<T = undefined>(guard: Guard<T | undefined>): UpdateRef<T | undefined>;
export default function useUpdateableRef<T>(guard: Guard<T>, initialValue: T): UpdateRef<T>;
export default function useUpdateableRef<T = undefined>(
  guard: Guard<T | undefined> = defaultGuard,
  initialValue?: T
): UpdateRef<T | undefined> {
  const ref = useRef<T | undefined>(initialValue);

  return useCallback((value: T | undefined) => {
    if (guard(value, ref.current)) {
      ref.current = value;
    }

    return ref.current;
  }, []);
}
