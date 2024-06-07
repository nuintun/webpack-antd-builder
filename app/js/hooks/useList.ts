/**
 * @module useList
 */

import usePagingRequest, {
  Dispatch,
  hasQuery,
  Options as InitOptions,
  Pagination as RequestPagination,
  Refs as RequestRefs,
  RequestOptions as RequestInit,
  Sorter,
  Transform
} from './usePagingRequest';
import useLatestRef from './useLatestRef';
import { useCallback, useMemo } from 'react';
import useSearches, { Search } from './useSearches';
import { GetProp, ListProps, PaginationProps } from 'antd';
import usePagingOptions, { Options as UsePagingOptions } from './usePagingOptions';

export interface Fetch {
  (options?: RequestOptions): void;
}

export interface RequestOptions extends RequestInit {
  sorter?: Sorter | false;
  pagination?: Pagination;
}

export interface Refs<I, E> extends RequestRefs<I, E> {
  readonly sorter: Sorter | false;
}

export type OnChange = GetProp<PaginationProps, 'onChange'>;

export interface Options<I, E, T> extends InitOptions<I, E, T> {
  pagination?: Pagination;
}

export type Pagination = (UsePagingOptions & Partial<RequestPagination>) | false;

export type DefaultListProps<I> = Required<Pick<ListProps<I>, 'loading' | 'dataSource' | 'pagination'>>;

/**
 * @function useList
 * @description [hook] 列表操作
 * @param url 请求地址
 * @param options 请求配置
 * @param initialLoadingState 初始加载状态
 */
export default function useList<I, E = unknown>(
  url: string,
  options?: Options<I, E, I>,
  initialLoadingState?: boolean | (() => boolean)
): [props: DefaultListProps<I>, fetch: Fetch, dispatch: Dispatch<I[]>, refs: Refs<I, E>];
/**
 * @function useList
 * @description [hook] 列表操作
 * @param url 请求地址
 * @param options 请求配置
 * @param initialLoadingState 初始加载状态
 */
export default function useList<I, E = unknown, T = I>(
  url: string,
  options: Options<I, E, T> & { transform: Transform<I, T> },
  initialLoadingState?: boolean | (() => boolean)
): [props: DefaultListProps<T>, fetch: Fetch, dispatch: Dispatch<T[]>, refs: Refs<I, E>];
/**
 * @function useList
 * @description [hook] 列表操作
 * @param url 请求地址
 * @param options 请求配置
 * @param initialLoadingState 初始加载状态
 */
export default function useList<I, E = unknown, T = I>(
  url: string,
  options: Options<I, E, T> = {},
  initialLoadingState?: boolean | (() => boolean)
): [props: DefaultListProps<I | T>, fetch: Fetch, dispatch: Dispatch<I[] | T[]>, refs: Refs<I, E>] {
  const opitonsRef = useLatestRef(options);
  const getPagingOptions = usePagingOptions(options.pagination);
  const [serialize, raw] = useSearches<[Search, Sorter]>([false, false]);

  const [loading, dataSource, request, dispatch, originRefs] = usePagingRequest(
    url,
    options as Options<I, E, I>,
    initialLoadingState
  );

  const fetch: Fetch = useCallback((options = {}) => {
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

  return [{ loading, dataSource, pagination }, fetch, dispatch as Dispatch<I[] | T[]>, refs];
}
