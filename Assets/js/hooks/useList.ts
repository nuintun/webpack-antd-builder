/**
 * @module useList
 */

import { useCallback, useMemo } from 'react';

import usePersistRef from './usePersistRef';
import usePagingRequest, {
  hasQuery,
  Options as UseRequestOptions,
  Pagination as UseRequestPagination,
  Refs as RequestRefs,
  RequestOptions as UseRequestInit,
  Sorter,
  TransformOptions as UseRequestTransformOptions
} from './usePagingRequest';
import { ListProps, PaginationProps } from 'antd';
import useSearches, { Search } from './useSearches';
import usePagingOptions, { Options as UsePagingOptions } from './usePagingOptions';

type OnChange = NonNullable<PaginationProps['onChange']>;

type Pagination = (UsePagingOptions & Partial<UseRequestPagination>) | false;

type DefaultListProps<I> = Required<Pick<ListProps<I>, 'loading' | 'dataSource' | 'pagination'>>;

interface Refs<I, E = {}> extends RequestRefs<I, E> {
  readonly sorter: Sorter | false;
}

export interface Options<I> extends UseRequestOptions<I> {
  pagination?: Pagination;
}

export interface TransformOptions<I, T> extends UseRequestTransformOptions<I, T> {
  pagination?: Pagination;
}

export interface RequestOptions extends UseRequestInit {
  sorter?: Sorter | false;
  pagination?: Pagination;
}

/**
 * @function useList
 * @description [hook] 列表操作
 * @param url 请求地址
 * @param options 请求配置
 * @param initialLoadingState 初始加载状态
 */
export default function useList<I, E = {}>(
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
  const [serialize, raw] = useSearches<[Search, Sorter]>([false, false]);
  const initOptionsRef = usePersistRef(options as TransformOptions<I, T>);

  const [loading, dataSource, request, originRefs] = usePagingRequest<I, E, T>(
    url,
    options as TransformOptions<I, T>,
    initialLoadingState
  );

  const fetch = useCallback((options: RequestOptions = {}) => {
    const { search, sorter } = options;
    const query = serialize([search, sorter]);

    return request({ ...initOptionsRef.current, ...options, search: query });
  }, []);

  const onChange = useCallback<OnChange>((page, pageSize) => {
    fetch({ pagination: { page, pageSize } });
  }, []);

  const pagination = useMemo(() => {
    const refsPagination = originRefs.pagination;

    if (hasQuery(refsPagination)) {
      const { total = 0 } = originRefs.response;
      const { page, pageSize } = refsPagination;

      return {
        total,
        pageSize,
        onChange,
        current: page,
        onShowSizeChange: onChange,
        ...getPagingOptions(pageSize)
      };
    }

    return refsPagination;
  }, [originRefs.pagination, originRefs.response.total]);

  const refs = useMemo<Refs<I, E>>(() => {
    return {
      get search() {
        const [search] = raw();

        return search;
      },
      get sorter() {
        const [, sorter] = raw();

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

  return [{ loading, dataSource, pagination }, fetch, refs];
}
