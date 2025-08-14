/**
 * @module useSearchFilters
 */

import { useCallback, useRef } from 'react';

/**
 * @function useSearchFilters
 * @description [hook] 可缓存查询过滤条件
 * @param initialFilters 初始化查询过滤条件
 */
export default function useSearchFilters<T extends unknown[]>(
  initialFilters: T
): [getFilters: () => T, updateFilters: (value: Partial<T>) => void] {
  const searchFiltersRef = useRef(initialFilters);

  const getFilters = useCallback(() => {
    return searchFiltersRef.current;
  }, []);

  const updateFilters = useCallback((value: Partial<T>): void => {
    searchFiltersRef.current = searchFiltersRef.current.map((search, index) => {
      return value[index] ?? search;
    }) as T;
  }, []);

  return [getFilters, updateFilters];
}
