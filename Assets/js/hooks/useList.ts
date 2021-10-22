/**
 * @module useList
 */

import { useCallback } from 'react';

import { PaginationProps } from 'antd';
import usePagingRequest, {
  hasQuery,
  Options as RequestOptions,
  Pagination as RequestPagination,
  Refs,
  Response,
  TransformOptions as RequestTransformOptions
} from './usePagingRequest';
import usePagingOptions, { Options as PagingOptions } from './usePagingOptions';

type Pagination = PaginationProps | false;

type OnChange = NonNullable<PaginationProps['onChange']>;

export interface Options extends Omit<RequestOptions, 'search' | 'pagination'> {
  pagination?: (PagingOptions & Partial<RequestPagination>) | false;
}

export interface TransformOptions<I, T> extends Omit<RequestTransformOptions<I, T>, 'search' | 'pagination'> {
  pagination?: (PagingOptions & Partial<RequestPagination>) | false;
}

/**
 * @function useList
 * @description [hook] 列表操作
 * @param url 请求地址
 * @param options 请求配置
 */
export default function useList<I>(
  url: string,
  options?: Options
): [
  loading: boolean,
  dataSource: I[],
  fetch: (options?: RequestOptions) => Promise<Response<I>>,
  pagination: PaginationProps | false,
  refs: Refs<I>
];
/**
 * @function useList
 * @description [hook] 列表操作
 * @param url 请求地址
 * @param options 请求配置
 */
export default function useList<I, E>(
  url: string,
  options?: Options
): [
  loading: boolean,
  dataSource: I[],
  fetch: (options?: RequestOptions) => Promise<Response<I, E>>,
  pagination: PaginationProps | false,
  refs: Refs<I, E>
];
/**
 * @function useList
 * @description [hook] 列表操作
 * @param url 请求地址
 * @param options 请求配置
 */
export default function useList<I, E, T>(
  url: string,
  options: TransformOptions<I, T>
): [
  loading: boolean,
  dataSource: T[],
  fetch: (options?: RequestOptions) => Promise<Response<I, E>>,
  pagination: PaginationProps | false,
  refs: Refs<I, E>
];
export default function useList<I, E, T>(
  url: string,
  options: Options | TransformOptions<I, T> = {}
): [
  loading: boolean,
  dataSource: I[] | T[],
  fetch: (options?: RequestOptions) => Promise<Response<I, E>>,
  pagination: PaginationProps | false,
  refs: Refs<I, E>
] {
  const resolvePagingOptions = usePagingOptions(options.pagination);
  const [loading, dataSource, fetch, refs] = usePagingRequest<I, E, T>(url, options as TransformOptions<I, T>);

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
      ...resolvePagingOptions(pageSize)
    };
  }

  return [loading, dataSource, fetch, pagination, refs];
}
