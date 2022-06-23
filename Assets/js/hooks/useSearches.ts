/**
 * @module useSearches
 */

import { useCallback, useRef } from 'react';

type Searches<T extends unknown[]> = {
  [K in keyof T]: T[K] | false;
};

type Search = Record<string | number, any>;

/**
 * @function useSearches
 * @description [hook] 可缓存查询条件
 * @param initialValue 初始化查询条件
 */
export default function useSearches<T extends Search[]>(
  initialValue: Searches<T>
): [set: (value: Partial<Searches<T>>) => void, get: () => Searches<T>, resolve: () => Search] {
  const searchRef = useRef(initialValue);

  const set = useCallback((value: Partial<Searches<T>>) => {
    searchRef.current = searchRef.current.map((search, index) => {
      const nextValue = value[index];

      return nextValue === false ? search : nextValue;
    }) as T;
  }, []);

  const get = useCallback(() => {
    return searchRef.current;
  }, []);

  const resolve = useCallback(() => {
    return searchRef.current.reduce<Search>((values, value) => {
      return value ? { ...values, ...value } : values;
    }, {});
  }, []);

  return [set, get, resolve];
}

const [set] = useSearches<[Search]>([false]);
