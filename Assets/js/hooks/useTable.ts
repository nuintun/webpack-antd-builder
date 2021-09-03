/**
 * @module useTable
 */

import React, { useCallback, useMemo, useRef } from 'react';

import usePagingRequest, {
  hasQuery,
  Options as PagingRequestOptions,
  Query as PagingRequestQuery,
  Refs as PagingRequestRefs,
  Response,
  Search,
  updateRef
} from './usePagingRequest';
import { message, TableProps } from 'antd';
import usePersistCallback from './usePersistCallback';
import usePagingOptions, { Options as PagingOptions } from './usePagingOptions';

type Filter = Search;

type SorterField = React.Key | React.Key[];

type Pagination<I> = TableProps<I>['pagination'];

type OnChange<I> = NonNullable<TableProps<I>['onChange']>;

type Query = Filter & Partial<Sorter> & PagingRequestQuery;

type DefaultTableProps<I> = Required<Pick<TableProps<I>, 'size' | 'loading' | 'onChange' | 'dataSource' | 'pagination'>>;

interface Sorter {
  orderBy: (string | number)[];
  orderType: ('ascend' | 'descend')[];
}

interface RequestOptions extends PagingRequestOptions {
  filter?: Filter | false;
  sorter?: Sorter | false;
}

interface Refs<I, E> extends PagingRequestRefs<I, E> {
  readonly filter: Filter | false;
  readonly sorter: Sorter | false;
}

export interface Options<I, T = I> {
  pagination?: PagingOptions;
  transform?: (items: I[]) => T[];
}

function serializeField(filed: SorterField): React.Key {
  return Array.isArray(filed) ? filed.join('.') : filed;
}

/**
 * @function useTable
 * @description 【Hook】 表格操作
 * @param url 请求地址
 * @param options 请求配置
 */
export default function useTable<I, E extends object = {}, T = I>(
  url: string,
  options: Options<I, T> = {}
): [props: DefaultTableProps<T>, fetch: (options?: RequestOptions) => Promise<Response<I, E>>, refs: Refs<I, E>] {
  const searchRef = useRef<Search | false>(false);
  const filterRef = useRef<Filter | false>(false);
  const sorterRef = useRef<Sorter | false>(false);
  const getPagingOptions = usePagingOptions(options.pagination);
  const [loading, dataSource, request, originRefs] = usePagingRequest<I, E, T>(url, options.transform);

  const fetch = usePersistCallback((options: RequestOptions = {}) => {
    const search: Query = {
      ...updateRef(searchRef, options.search),
      ...updateRef(filterRef, options.filter),
      ...updateRef(sorterRef, options.sorter)
    };

    return request({ search, pagination: options.pagination });
  });

  const onChange = useCallback<OnChange<T>>(async (pagination, filter, sorter, { action }) => {
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

  const originRefsPagination = originRefs.pagination;

  let pagination: Pagination<T> = false;

  if (hasQuery(originRefsPagination)) {
    const { total = 0 } = originRefs.response;
    const { page, pageSize } = originRefsPagination;

    pagination = {
      total,
      pageSize,
      current: page,
      ...getPagingOptions(pageSize)
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
