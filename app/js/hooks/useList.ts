/**
 * @module useList
 */

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
import { useCallback, useMemo } from 'react';
import { ListProps, PaginationProps } from 'antd';
import useSearches, { Search } from './useSearches';
import usePagingOptions, { Options as UsePagingOptions } from './usePagingOptions';

interface Refs<I, E> extends RequestRefs<I, E> {
  readonly sorter: Sorter | false;
}

type OnChange = NonNullable<PaginationProps['onChange']>;

type Pagination = (UsePagingOptions & Partial<RequestPagination>) | false;

type DefaultListProps<I> = Required<Pick<ListProps<I>, 'loading' | 'dataSource' | 'pagination'>>;

export interface Options<I, E> extends InitOptions<I, E> {
  pagination?: Pagination;
}

export interface TransformOptions<I, T> extends InitTransformOptions<I, EXT_blend_minmax, T> {
  pagination?: Pagination;
}

export interface RequestOptions extends RequestInit {
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
  options?: Options<I, E>,
  initialLoadingState?: boolean | (() => boolean)
): [props: DefaultListProps<I>, fetch: (options?: RequestOptions) => void, refs: Refs<I, E>];
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
): [props: DefaultListProps<T>, fetch: (options?: RequestOptions) => void, refs: Refs<I, E>];
export default function useList<I, E, T>(
  url: string,
  options: Options<I, E> | TransformOptions<I, T> = {},
  initialLoadingState?: boolean | (() => boolean)
): [props: DefaultListProps<I | T>, fetch: (options?: RequestOptions) => void, refs: Refs<I, E>] {
  const opitonsRef = useLatestRef(options);
  const getPagingOptions = usePagingOptions(options.pagination);
  const [serialize, raw] = useSearches<[Search, Sorter]>([false, false]);

  const [loading, dataSource, request, originRefs] = usePagingRequest<I, E, T>(
    url,
    options as TransformOptions<I, T>,
    initialLoadingState
  );

  const fetch = useCallback((options: RequestOptions = {}): void => {
    const { search, sorter } = options;
    const query = serialize([search, sorter]);

    request({ ...opitonsRef.current, ...options, search: query });
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
        ...getPagingOptions(pageSize),
        onShowSizeChange: onChange,
        current: page,
        pageSize,
        onChange,
        total
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
