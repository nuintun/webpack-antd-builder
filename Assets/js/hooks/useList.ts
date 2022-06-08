/**
 * @module useList
 */

import { useCallback } from 'react';

import usePagingRequest, {
  hasQuery,
  Options as UseRequestOptions,
  Pagination as UseRequestPagination,
  Refs,
  RequestOptions as UseRequestInit,
  TransformOptions as UseRequestTransformOptions
} from './usePagingRequest';
import { ListProps, PaginationProps } from 'antd';
import usePagingOptions, { Options as UsePagingOptions } from './usePagingOptions';

type OnChange = NonNullable<PaginationProps['onChange']>;

type Pagination = (UsePagingOptions & Partial<UseRequestPagination>) | false;

type DefaultListProps<I> = Required<Pick<ListProps<I>, 'loading' | 'dataSource' | 'pagination'>>;

export interface Options<I> extends UseRequestOptions<I> {
  pagination?: Pagination;
}

export interface TransformOptions<I, T> extends UseRequestTransformOptions<I, T> {
  pagination?: Pagination;
}

export interface RequestOptions extends UseRequestInit {
  pagination?: Pagination;
}

/**
 * @function useList
 * @description [hook] 列表操作
 * @param url 请求地址
 * @param options 请求配置
 * @param initialLoadingState 初始加载状态
 */
export default function useList<I>(
  url: string,
  options?: Options<I>,
  initialLoadingState?: boolean | (() => boolean)
): [props: DefaultListProps<I>, fetch: (options?: RequestOptions) => Promise<void>, refs: Refs<I>];
/**
 * @function useList
 * @description [hook] 列表操作
 * @param url 请求地址
 * @param options 请求配置
 * @param initialLoadingState 初始加载状态
 */
export default function useList<I, E>(
  url: string,
  options?: Options<I>,
  initialLoadingState?: boolean | (() => boolean)
): [props: DefaultListProps<I>, fetch: (options?: RequestOptions) => Promise<void>, refs: Refs<I, E>];
/**
 * @function useList
 * @description [hook] 列表操作
 * @param url 请求地址
 * @param options 请求配置
 * @param initialLoadingState 初始加载状态
 */
export default function useList<I, E, T>(
  url: string,
  options: TransformOptions<I, T>,
  initialLoadingState?: boolean | (() => boolean)
): [props: DefaultListProps<T>, fetch: (options?: RequestOptions) => Promise<void>, refs: Refs<I, E>];
export default function useList<I, E, T>(
  url: string,
  options: Options<I> | TransformOptions<I, T> = {},
  initialLoadingState?: boolean | (() => boolean)
): [props: DefaultListProps<I | T>, fetch: (options?: RequestOptions) => Promise<void>, refs: Refs<I, E>] {
  const getPagingOptions = usePagingOptions(options.pagination);
  const [loading, dataSource, fetch, refs] = usePagingRequest<I, E, T>(
    url,
    options as TransformOptions<I, T>,
    initialLoadingState
  );

  const onChange = useCallback<OnChange>((page, pageSize) => {
    fetch({ pagination: { page, pageSize } });
  }, []);

  let pagination: PaginationProps | false = false;

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

  return [{ loading, dataSource, pagination }, fetch, refs];
}
