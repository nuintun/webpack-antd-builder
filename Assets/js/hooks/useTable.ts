/**
 * @module useTable
 */

import React, { useCallback, useMemo } from 'react';

import { TableProps } from 'antd';
import useSearches from './useSearches';
import usePersistRef from './usePersistRef';
import usePagingRequest, {
  hasQuery,
  Options as UseRequestOptions,
  Pagination as UseRequestPagination,
  Refs as RequestRefs,
  RequestOptions as UseRequestInit,
  Search,
  Sorter,
  TransformOptions as UseRequestTransformOptions
} from './usePagingRequest';
import usePagingOptions, { Options as PagingOptions } from './usePagingOptions';

type Filter = Search;

type SorterField = React.Key | React.Key[];

type OnChange<I> = NonNullable<TableProps<I>['onChange']>;

type Pagination = (PagingOptions & Partial<UseRequestPagination>) | false;

type DefaultTableProps<I> = Required<Pick<TableProps<I>, 'size' | 'loading' | 'onChange' | 'dataSource' | 'pagination'>>;

interface Refs<I, E = {}> extends RequestRefs<I, E> {
  readonly filter: Filter | false;
  readonly sorter: Sorter | false;
}

function serializeField(filed: SorterField): React.Key {
  return Array.isArray(filed) ? filed.join('.') : filed;
}

export interface Options<I> extends UseRequestOptions<I> {
  pagination?: Pagination;
}

export interface TransformOptions<I, T> extends UseRequestTransformOptions<I, T> {
  pagination?: Pagination;
}

export interface RequestOptions extends UseRequestInit {
  filter?: Filter | false;
  sorter?: Sorter | false;
  pagination?: Pagination;
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
  options?: Options<I>,
  initialLoadingState?: boolean | (() => boolean)
): [props: DefaultTableProps<I>, fetch: (options?: RequestOptions) => Promise<void>, refs: Refs<I, E>];
/**
 * @function useTable
 * @description [hook] 表格操作
 * @param url 请求地址
 * @param options 请求配置
 * @param initialLoadingState 初始加载状态
 */
export default function useTable<I, E, T>(
  url: string,
  options: TransformOptions<I, T>,
  initialLoadingState?: boolean | (() => boolean)
): [props: DefaultTableProps<T>, fetch: (options?: RequestOptions) => Promise<void>, refs: Refs<I, E>];
export default function useTable<I, E, T>(
  url: string,
  options: Options<I> | TransformOptions<I, T> = {},
  initialLoadingState?: boolean | (() => boolean)
): [props: DefaultTableProps<I | T>, fetch: (options?: RequestOptions) => Promise<void>, refs: Refs<I, E>] {
  const getPagingOptions = usePagingOptions(options.pagination);
  const initOptionsRef = usePersistRef(options as TransformOptions<I, T>);
  const [serialize, raw] = useSearches<[Search, Filter, Sorter]>([false, false, false]);

  const [loading, dataSource, request, originRefs] = usePagingRequest<I, E, T>(
    url,
    options as TransformOptions<I, T>,
    initialLoadingState
  );

  const fetch = useCallback((options: RequestOptions = {}) => {
    const { search, filter, sorter } = options;
    const query: Search = serialize([search, filter, sorter]);

    return request({ ...initOptionsRef.current, ...options, search: query });
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

        sorter = Array.isArray(sorter) ? sorter : [sorter];

        for (const { columnKey, field, order } of sorter) {
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
        total,
        pageSize,
        current: page,
        ...getPagingOptions(pageSize)
      };
    }

    return originRefsPagination;
  }, [originRefs.pagination, originRefs.response.total]);

  const refs = useMemo<Refs<I, E>>(() => {
    return {
      ...originRefs,
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
      }
    };
  }, []);

  return [{ loading, onChange, dataSource, pagination, size: 'middle' }, fetch, refs];
}
