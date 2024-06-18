/**
 * @module useSearchFilters
 */

import { useCallback, useRef } from 'react';
import { Query as Filter } from '/js/utils/request';

export type { Filter };

export type SearchFilters<T extends Filter[]> = {
  [K in keyof T]: T[K] extends Filter ? T[K] | false : T[K];
};

/**
 * @function useSearchFilters
 * @description [hook] 可缓存查询过滤条件
 * @param initialValue 初始化查询过滤条件
 */
export default function useSearchFilters<T extends Filter[]>(
  initialValue: SearchFilters<T>
): [serialize: (value?: Partial<SearchFilters<T>>) => Filter, raw: () => SearchFilters<T>] {
  const searchFiltersRef = useRef(initialValue);

  const serialize = useCallback((value?: Partial<SearchFilters<T>>) => {
    if (value && searchFiltersRef.current !== value) {
      searchFiltersRef.current = searchFiltersRef.current.map((search, index) => {
        return value[index] ?? search;
      }) as SearchFilters<T>;
    }

    return searchFiltersRef.current.reduce<Filter>((values, value) => {
      return value ? { ...values, ...value } : values;
    }, {});
  }, []);

  const raw = useCallback(() => {
    return searchFiltersRef.current;
  }, []);

  return [serialize, raw];
}
