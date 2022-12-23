/**
 * @module useTable
 */

import React, { useCallback, useMemo } from 'react';

import { TableProps } from 'antd';
import useLatestRef from './useLatestRef';
import usePagingRequest, {
  hasQuery,
  Options as InitOptions,
  Pagination as RequestPagination,
  Refs as RequestRefs,
  RequestOptions as RequestInit,
  Sorter,
  TransformOptions as InitTransformOptions
} from './usePagingRequest';
import useSearches, { Search } from './useSearches';
import usePagingOptions, { Options as PagingOptions } from './usePagingOptions';

type Filter = Search;

type SorterField = React.Key | React.Key[];

type OnChange<I> = NonNullable<TableProps<I>['onChange']>;

type Pagination = (PagingOptions & Partial<RequestPagination>) | false;

type DefaultTableProps<I> = Required<Pick<TableProps<I>, 'size' | 'loading' | 'onChange' | 'dataSource' | 'pagination'>>;

interface Refs<I, E = {}> extends RequestRefs<I, E> {
  readonly filter: Filter | false;
  readonly sorter: Sorter | false;
}

export interface Options<I, E> extends InitOptions<I, E> {
  pagination?: Pagination;
}

export interface TransformOptions<I, E, T> extends InitTransformOptions<I, E, T> {
  pagination?: Pagination;
}

export interface RequestOptions extends RequestInit {
  filter?: Filter | false;
  sorter?: Sorter | false;
  pagination?: Pagination;
}

function serializeField(filed: SorterField): React.Key {
  return Array.isArray(filed) ? filed.join('.') : filed;
}

/**
 * @function useTable
 * @description [hook] 表格操作
 * @param url 请求地址
 * @param options 请求配置
 * @param initialLoadingState 初始加载状态
 */
export default function useTable<I, E = {}>(
  url: string,
  options?: Options<I, E>,
  initialLoadingState?: boolean | (() => boolean)
): [props: DefaultTableProps<I>, fetch: (options?: RequestOptions) => void, refs: Refs<I, E>];
/**
 * @function useTable
 * @description [hook] 表格操作
 * @param url 请求地址
 * @param options 请求配置
 * @param initialLoadingState 初始加载状态
 */
export default function useTable<I, E, T>(
  url: string,
  options: TransformOptions<I, E, T>,
  initialLoadingState?: boolean | (() => boolean)
): [props: DefaultTableProps<T>, fetch: (options?: RequestOptions) => void, refs: Refs<I, E>];
export default function useTable<I, E, T>(
  url: string,
  options: Options<I, E> | TransformOptions<I, E, T> = {},
  initialLoadingState?: boolean | (() => boolean)
): [props: DefaultTableProps<I | T>, fetch: (options?: RequestOptions) => void, refs: Refs<I, E>] {
  const opitonsRef = useLatestRef(options);
  const getPagingOptions = usePagingOptions(options.pagination);
  const [serialize, raw] = useSearches<[Search, Filter, Sorter]>([false, false, false]);

  const [loading, dataSource, request, originRefs] = usePagingRequest<I, E, T>(
    url,
    options as TransformOptions<I, E, T>,
    initialLoadingState
  );

  const fetch = useCallback((options: RequestOptions = {}): void => {
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
            if (columnKey || field) {
              orderBy.push(columnKey || serializeField(field as SorterField));
              orderType.push(order);
            } else {
              throw new Error('table column missing sort field');
            }
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

  return [{ loading, onChange, dataSource, pagination, size: 'middle' }, fetch, refs];
}
