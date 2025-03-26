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
  Transform
} from './usePagingRequest';
import useLatestRef from './useLatestRef';
import { GetProp, TableProps } from 'antd';
import React, { useCallback, useMemo } from 'react';
import useSearchFilters, { Filter } from './useSearchFilters';
import usePagingOptions, { Options as PagingOptions } from './usePagingOptions';

export interface Fetch {
  (options?: RequestOptions): void;
}

export interface Sorter {
  orderBy: React.Key[];
  orderType: ('ascend' | 'descend')[];
}

export interface RequestOptions extends RequestInit {
  filter?: Filter | false;
  sorter?: Sorter | false;
}

export type OnChange<I> = GetProp<TableProps<I>, 'onChange'>;

export interface Options<I, E, T> extends InitOptions<I, E, T> {
  pagination?: Pagination | false;
}

export interface Refs<I, E = {}> extends RequestRefs<I, E> {
  readonly filters: [filter: Filter | false, sorter: Sorter | false];
}

type TablePropsPicked = 'size' | 'onChange' | 'dataSource' | 'pagination';

type TablePagination = Exclude<GetProp<TableProps<unknown>, 'pagination'>, false>;

export interface DefaultTableProps<I> extends Required<Pick<TableProps<I>, TablePropsPicked>> {
  loading: boolean;
}

export type Pagination = Omit<PagingOptions & Partial<RequestPagination> & TablePagination, 'current'>;

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
export default function useTable<I, E = unknown>(
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
export default function useTable<I, E = unknown, T = I>(
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
export default function useTable<I, E = unknown, T = I>(
  url: string,
  options: Options<I, E, T> = {},
  initialLoadingState?: boolean | (() => boolean)
): [props: DefaultTableProps<I | T>, fetch: Fetch, dispatch: Dispatch<I[] | T[]>, refs: Refs<I, E>] {
  const opitonsRef = useLatestRef(options);
  const getPagingOptions = usePagingOptions(options.pagination);
  const [serialize, raw] = useSearchFilters<[Filter, Sorter]>([false, false]);

  const [loading, dataSource, request, dispatch, originRefs] = usePagingRequest(
    url,
    options as Options<I, E, I>,
    initialLoadingState
  );

  const fetch: Fetch = useCallback((options = {}): void => {
    const { filter, sorter } = options;
    const { current: initOptions } = opitonsRef;
    const query = { ...initOptions.query, ...options.query, ...serialize([filter, sorter]) };

    request({ ...opitonsRef.current, ...options, query });
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

  const pagination = useMemo<GetProp<TableProps<I>, 'pagination'>>(() => {
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
      get filters() {
        return raw();
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
