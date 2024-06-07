/**
 * @module useTable
 */

import usePagingRequest, {
  Dispatch,
  hasQuery,
  Options as InitOptions,
  Pagination as RequestPagination,
  Refs as RequestRefs,
  RequestOptions as RequestInit,
  Sorter,
  Transform
} from './usePagingRequest';
import useLatestRef from './useLatestRef';
import { GetProp, TableProps } from 'antd';
import React, { useCallback, useMemo } from 'react';
import useSearches, { Search } from './useSearches';
import usePagingOptions, { Options as PagingOptions } from './usePagingOptions';

export type Filter = Search;

export interface Fetch {
  (options?: RequestOptions): void;
}

export interface RequestOptions extends RequestInit {
  filter?: Filter | false;
  sorter?: Sorter | false;
  pagination?: Pagination;
}

export interface Refs<I, E = {}> extends RequestRefs<I, E> {
  readonly filter: Filter | false;
  readonly sorter: Sorter | false;
}

export interface Options<I, E, T> extends InitOptions<I, E, T> {
  pagination?: Pagination;
}

export type OnChange<I> = GetProp<TableProps<I>, 'onChange'>;

export type Pagination = (PagingOptions & Partial<RequestPagination>) | false;

export type DefaultTableProps<I> = Required<Pick<TableProps<I>, 'size' | 'loading' | 'onChange' | 'dataSource' | 'pagination'>>;

/**
 * @function serializeField
 * @description 字段序列化
 * @param filed 字段
 */
export function serializeField(filed: React.Key | readonly React.Key[]): React.Key {
  return Array.isArray(filed) ? filed.join('.') : (filed as React.Key);
}

/**
 * @function useTable
 * @description [hook] 表格操作
 * @param url 请求地址
 * @param options 请求配置
 * @param initialLoadingState 初始加载状态
 */
export default function useTable<I, E>(
  url: string,
  options?: Options<I, E, I>,
  initialLoadingState?: boolean | (() => boolean)
): [props: DefaultTableProps<I>, fetch: Fetch, dispatch: Dispatch<I[]>, refs: Refs<I, E>];
/**
 * @function useTable
 * @description [hook] 表格操作
 * @param url 请求地址
 * @param options 请求配置
 * @param initialLoadingState 初始加载状态
 */
export default function useTable<I, E, T>(
  url: string,
  options: Options<I, E, T> & { transform: Transform<I, T> },
  initialLoadingState?: boolean | (() => boolean)
): [props: DefaultTableProps<T>, fetch: Fetch, dispatch: Dispatch<T[]>, refs: Refs<I, E>];
/**
 * @function useTable
 * @description [hook] 表格操作
 * @param url 请求地址
 * @param options 请求配置
 * @param initialLoadingState 初始加载状态
 */
export default function useTable<I, E, T>(
  url: string,
  options: Options<I, E, T> = {},
  initialLoadingState?: boolean | (() => boolean)
): [props: DefaultTableProps<I | T>, fetch: Fetch, dispatch: Dispatch<I[] | T[]>, refs: Refs<I, E>] {
  const opitonsRef = useLatestRef(options);
  const getPagingOptions = usePagingOptions(options.pagination);
  const [serialize, raw] = useSearches<[Search, Filter, Sorter]>([false, false, false]);

  const [loading, dataSource, request, dispatch, originRefs] = usePagingRequest(
    url,
    options as Options<I, E, I>,
    initialLoadingState
  );

  const fetch: Fetch = useCallback((options = {}): void => {
    const { search, filter, sorter } = options;
    const query = serialize([search, filter, sorter]);

    request({ ...opitonsRef.current, ...options, search: query });
  }, []);

  const onChange = useCallback<OnChange<I | T>>((pagination, filter, sorter, { action }) => {
    switch (action) {
      case 'filter':
        return fetch({ filter });
      case 'paginate':
        return fetch({ pagination: { page: pagination.current, pageSize: pagination.pageSize } });
      case 'sort':
        const orderBy: Sorter['orderBy'] = [];
        const orderType: Sorter['orderType'] = [];
        const items = Array.isArray(sorter) ? sorter : [sorter];

        for (const { columnKey, field, order } of items) {
          if (order) {
            if (columnKey) {
              orderBy.push(columnKey);
            } else if (field) {
              orderBy.push(serializeField(field));
            } else {
              throw new Error('table column missing sort field');
            }

            orderType.push(order);
          }
        }

        return fetch({ sorter: { orderBy, orderType } });
    }
  }, []);

  const pagination = useMemo(() => {
    const originRefsPagination = originRefs.pagination;

    if (hasQuery(originRefsPagination)) {
      const { total = 0 } = originRefs.response;
      const { page, pageSize } = originRefsPagination;

      return {
        ...getPagingOptions(pageSize),
        current: page,
        pageSize,
        total
      };
    }

    return originRefsPagination;
  }, [originRefs.pagination, originRefs.response.total]);

  const refs = useMemo<Refs<I, E>>(() => {
    return {
      get search() {
        const [search] = raw();

        return search;
      },
      get filter() {
        const [, filter] = raw();

        return filter;
      },
      get sorter() {
        const [, , sorter] = raw();

        return sorter;
      },
      get response() {
        return originRefs.response;
      },
      get pagination() {
        return originRefs.pagination;
      }
    };
  }, []);

  const props: DefaultTableProps<I | T> = {
    loading,
    onChange,
    dataSource,
    pagination,
    size: 'middle'
  };

  return [props, fetch, dispatch as Dispatch<I[] | T[]>, refs];
}
