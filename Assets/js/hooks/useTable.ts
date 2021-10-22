/**
 * @module useTable
 */

import React, { useCallback, useMemo, useRef } from 'react';

import { message, TableProps } from 'antd';
import usePagingRequest, {
  hasQuery,
  Options as PagingRequestOptions,
  Pagination as RequestPagination,
  Query as RequestQuery,
  Refs as RequestRefs,
  Response,
  Search,
  TransformOptions as RequestTransformOptions,
  updateRef
} from './usePagingRequest';
import usePersistCallback from './usePersistCallback';
import usePagingOptions, { Options as PagingOptions } from './usePagingOptions';

type Filter = Search;

type SorterField = React.Key | React.Key[];

type Pagination<I> = TableProps<I>['pagination'];

type Query = Filter & Partial<Sorter> & RequestQuery;

type OnChange<I> = NonNullable<TableProps<I>['onChange']>;

type DefaultTableProps<I> = Required<Pick<TableProps<I>, 'size' | 'loading' | 'onChange' | 'dataSource' | 'pagination'>>;

interface Sorter {
  orderBy: (string | number)[];
  orderType: ('ascend' | 'descend')[];
}

interface Refs<I, E = {}> extends RequestRefs<I, E> {
  readonly filter: Filter | false;
  readonly sorter: Sorter | false;
}

function serializeField(filed: SorterField): React.Key {
  return Array.isArray(filed) ? filed.join('.') : filed;
}

interface RequestOptions extends Omit<PagingRequestOptions, 'transform'> {
  filter?: Filter | false;
  sorter?: Sorter | false;
}

export interface Options extends Omit<PagingRequestOptions, 'search' | 'pagination'> {
  pagination?: (PagingOptions & Partial<RequestPagination>) | false;
}

export interface TransformOptions<I, T> extends Omit<RequestTransformOptions<I, T>, 'search' | 'pagination'> {
  pagination?: (PagingOptions & Partial<RequestPagination>) | false;
}

/**
 * @function useTable
 * @description [hook] 表格操作
 * @param url 请求地址
 * @param options 请求配置
 */
export default function useTable<I>(
  url: string,
  options?: Options
): [props: DefaultTableProps<I>, fetch: (options?: RequestOptions) => Promise<Response<I>>, refs: Refs<I>];
/**
 * @function useTable
 * @description [hook] 表格操作
 * @param url 请求地址
 * @param options 请求配置
 */
export default function useTable<I, E = {}>(
  url: string,
  options?: Options
): [props: DefaultTableProps<I>, fetch: (options?: RequestOptions) => Promise<Response<I, E>>, refs: Refs<I, E>];
/**
 * @function useTable
 * @description [hook] 表格操作
 * @param url 请求地址
 * @param options 请求配置
 */
export default function useTable<I, E, T>(
  url: string,
  options: TransformOptions<I, T>
): [props: DefaultTableProps<T>, fetch: (options?: RequestOptions) => Promise<Response<I, E>>, refs: Refs<I, E>];
export default function useTable<I, E, T>(
  url: string,
  options: Options | TransformOptions<I, T> = {}
): [props: DefaultTableProps<I | T>, fetch: (options?: RequestOptions) => Promise<Response<I, E>>, refs: Refs<I, E>] {
  const searchRef = useRef<Search | false>(false);
  const filterRef = useRef<Filter | false>(false);
  const sorterRef = useRef<Sorter | false>(false);
  const resolvePagingOptions = usePagingOptions(options.pagination);
  const { transform, ...restOptions } = options as TransformOptions<I, T>;
  const [loading, dataSource, request, originRefs] = usePagingRequest<I, E, T>(url, options as TransformOptions<I, T>);

  const fetch = usePersistCallback((options: RequestOptions = {}) => {
    const search: Query = {
      ...updateRef(searchRef, options.search),
      ...updateRef(filterRef, options.filter),
      ...updateRef(sorterRef, options.sorter)
    };

    return request({ ...restOptions, ...options, search, pagination: options.pagination });
  });

  const onChange = useCallback<OnChange<I | T>>(async (pagination, filter, sorter, { action }) => {
    try {
      switch (action) {
        case 'filter':
          return await fetch({ filter });
        case 'paginate':
          return await fetch({ pagination: { page: pagination.current, pageSize: pagination.pageSize } });
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

          return await fetch({ sorter: { orderBy, orderType } });
      }
    } catch (error) {
      message.error(error.message);
    }
  }, []);

  let pagination: Pagination<T> = false;

  const originRefsPagination = originRefs.pagination;

  if (hasQuery(originRefsPagination)) {
    const { total = 0 } = originRefs.response;
    const { page, pageSize } = originRefsPagination;

    pagination = {
      total,
      pageSize,
      current: page,
      ...resolvePagingOptions(pageSize)
    };
  }

  const refs = useMemo<Refs<I, E>>(() => {
    return {
      get search() {
        return searchRef.current;
      },
      get filter() {
        return filterRef.current;
      },
      get sorter() {
        return sorterRef.current;
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
