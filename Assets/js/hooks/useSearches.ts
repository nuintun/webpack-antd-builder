/**
 * @module useSearches
 */

import { useCallback, useRef } from 'react';

import { Query as Search } from '/js/utils/request';

export type { Search };

export type Searches<T extends unknown[]> = {
  [K in keyof T]: T[K] | false;
};

/**
 * @function useSearches
 * @description [hook] 可缓存查询条件
 * @param initialValue 初始化查询条件
 */
export default function useSearches<T extends Search[]>(
  initialValue: Searches<T>
): [serialize: (value?: Partial<Searches<T>>) => Search, raw: () => Searches<T>] {
  const searchRef = useRef(initialValue);

  const serialize = useCallback((value?: Partial<Searches<T>>) => {
    if (value && searchRef.current !== value) {
      searchRef.current = searchRef.current.map((search, index) => {
        const nextValue = value[index];

        if (nextValue === false) return nextValue;

        return nextValue ?? search;
      }) as T;
    }

    return searchRef.current.reduce<Search>((values, value) => {
      return value ? { ...values, ...value } : values;
    }, {});
  }, []);

  const raw = useCallback(() => {
    return searchRef.current;
  }, []);

  return [serialize, raw];
}
