/**
 * @module useList
 */

import { useCallback } from 'react';

import { PaginationProps } from 'antd';
import usePagingOptions, { Options as PagingOptions } from './usePagingOptions';
import usePagingRequest, { hasQuery, Options as RequestOptions, Refs, Response } from './usePagingRequest';

type Pagination = PaginationProps | false;

type OnChange = NonNullable<PaginationProps['onChange']>;

export interface Options<I, T = I> {
  pagination?: PagingOptions;
  transform?: (items: I[]) => T[];
}

/**
 * @function useList
 * @description [hook] 列表操作
 * @param url 请求地址
 * @param options 请求配置
 */
export default function useList<I, E extends object = {}, T = I>(
  url: string,
  options: Options<I, T> = {}
): [
  loading: boolean,
  dataSource: T[],
  fetch: (options?: RequestOptions) => Promise<Response<I, E>>,
  pagination: PaginationProps | false,
  refs: Refs<I, E>
] {
  const getPagingOptions = usePagingOptions(options.pagination);
  const [loading, dataSource, fetch, refs] = usePagingRequest<I, E, T>(url, options.transform);

  const onChange = useCallback<OnChange>((page, pageSize) => {
    fetch({ pagination: { page, pageSize } });
  }, []);

  let pagination: Pagination = false;

  const refsPagination = refs.pagination;

  if (hasQuery(refsPagination)) {
    const { total = 0 } = refs.response;
    const { page, pageSize } = refsPagination;

    pagination = {
      total,
      pageSize,
      onChange,
      current: page,
      onShowSizeChange: onChange,
      ...getPagingOptions(pageSize)
    };
  }

  return [loading, dataSource, fetch, pagination, refs];
}
