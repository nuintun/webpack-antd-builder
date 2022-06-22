/**
 *
 */

import { useMemo, useRef } from 'react';

import memoizeOne from 'memoize-one';

export default function useSearch<T extends Record<string | number, any>>(initialState: T) {
  const searchRef = useRef(initialState);

  return useMemo(() => {
    return memoizeOne((value?: T) => {
      if (value != null) {
        searchRef.current = value;
      }

      const values = searchRef.current;

      if (Array.isArray(values)) {
        return values.reduce<Record<string | number, any>>((values, value) => {
          return { ...values, ...value };
        }, {});
      }

      return values;
    });
  }, []);
}
