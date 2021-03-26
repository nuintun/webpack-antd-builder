import { useCallback, useRef } from 'react';

import storage from '~js/utils/storage';
import usePersistCallback from './usePersistCallback';

export default function useStorage<V>(key: string): [set: (value: V) => void, get: () => V | null] {
  const cache = useRef<V | null>(storage.get<V>(key));

  const set = usePersistCallback(value => {
    storage.set<V>(key, (cache.current = value));
  });

  const get = useCallback(() => cache.current, []);

  return [set, get];
}
