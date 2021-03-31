/**
 * @module useTable
 */

import { useCallback, useMemo, useRef } from 'react';

import usePagingRequest, {
  getAndUpdateRef,
  hasQuery,
  Options as PagingRequestOptions,
  Query as PagingRequestQuery,
  Refs as PagingRequestRefs,
  Response,
  Search
} from './usePagingRequest';
import { message, TableProps } from 'antd';
import usePersistCallback from './usePersistCallback';
import usePagingOptions, { Options } from './usePagingOptions';

type Filter = Search;

interface Sorter {
  orderBy: string | number;
  orderType: 'ascend' | 'descend';
}

interface RequestOptions extends PagingRequestOptions {
  filter?: Filter | false;
  sorter?: Sorter | false;
}

type Pagination<I> = TableProps<I>['pagination'];

type Query = Filter & Partial<Sorter> & PagingRequestQuery;

type OnChange<I> = NonNullable<TableProps<I>['onChange']>;

type DefaultTableProps<I> = Required<Pick<TableProps<I>, 'size' | 'loading' | 'onChange' | 'dataSource' | 'pagination'>>;

interface Refs<I, E> extends PagingRequestRefs<I, E> {
  readonly filter: Filter | false;
  readonly sorter: Sorter | false;
}

export type { Options };

/**
 * @function useTable
 * @description 【Hook】 表格操作
 * @param url 请求地址
 * @param options 请求配置
 */
export default function useTable<I, E extends object = {}>(
  url: string,
  options?: Options
): [props: DefaultTableProps<I>, fetch: (options?: RequestOptions) => Promise<Response<I, E>>, refs: Refs<I, E>] {
  const searchRef = useRef<Search | false>(false);
  const filterRef = useRef<Filter | false>(false);
  const sorterRef = useRef<Sorter | false>(false);
  const resolvePagingOptions = usePagingOptions(options);
  const [loading, dataSource, request, originRefs] = usePagingRequest<I, E>(url);

  const fetch = usePersistCallback((options: RequestOptions = {}) => {
    const search: Query = {
      ...getAndUpdateRef(searchRef, options.search),
      ...getAndUpdateRef(filterRef, options.filter),
      ...getAndUpdateRef(sorterRef, options.sorter)
    };

    return request({ search, pagination: options.pagination });
  });

  const onChange = useCallback<OnChange<I>>(async (pagination, filter, sorter, { action }) => {
    try {
      switch (action) {
        case 'filter':
          return await fetch({ filter });
        case 'paginate':
          return await fetch({ pagination: { page: pagination.current, pageSize: pagination.pageSize } });
        case 'sort':
          if (Array.isArray(sorter) || Array.isArray(sorter.field)) {
            throw new Error('multiple sorter not support');
          }

          if (!sorter.order) return await fetch({ sorter: false });

          const orderBy = sorter.columnKey || (sorter.field as string | number) || '';

          return await fetch({ sorter: { orderBy, orderType: sorter.order } });
      }
    } catch (error) {
      message.error(error.message);
    }
  }, []);

  const originRefsPagination = originRefs.pagination;

  let pagination: Pagination<I> = false;

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
