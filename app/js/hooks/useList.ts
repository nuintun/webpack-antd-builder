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
  Transform
} from './usePagingRequest';
import useLatestRef from './useLatestRef';
import { useCallback, useMemo } from 'react';
import { GetProp, ListProps, PaginationProps } from 'antd';
import useSearchFilters, { Filter } from './useSearchFilters';
import usePagingOptions, { Options as PagingOptions } from './usePagingOptions';

export interface Fetch {
  (options?: RequestOptions): void;
}

export interface Sorter {
  orderBy: React.Key[];
  orderType: ('ascend' | 'descend')[];
}

type ListPropsPicked = 'dataSource' | 'pagination';

export interface RequestOptions extends RequestInit {
  filter?: Filter | false;
  sorter?: Sorter | false;
  pagination?: Pagination;
}

export type OnChange = GetProp<PaginationProps, 'onChange'>;

export interface Options<I, E, T> extends InitOptions<I, E, T> {
  pagination?: Pagination;
}

export interface Refs<I, E> extends RequestRefs<I, E> {
  readonly filters: [filter: Filter | false, sorter: Sorter | false];
}

export type Pagination = (PagingOptions & Partial<RequestPagination>) | false;

export interface DefaultListProps<I> extends Required<Pick<ListProps<I>, ListPropsPicked>> {
  loading: boolean;
}

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
  const [serialize, raw] = useSearchFilters<[Filter, Sorter]>([false, false]);

  const [loading, dataSource, request, dispatch, originRefs] = usePagingRequest(
    url,
    options as Options<I, E, I>,
    initialLoadingState
  );

  const fetch: Fetch = useCallback((options = {}) => {
    const { filter, sorter } = options;
    const { current: initOptions } = opitonsRef;
    const query = { ...initOptions.query, ...serialize([filter, sorter]) };

    request({ ...opitonsRef.current, ...options, query });
  }, []);

  const onChange = useCallback<OnChange>((page, pageSize) => {
    const { pagination } = opitonsRef.current;

    if (pagination) {
      pagination.onChange?.(page, pageSize);
    }

    fetch({ pagination: { page, pageSize } });
  }, []);

  const pagination = useMemo(() => {
    const refsPagination = originRefs.pagination;

    if (hasQuery(refsPagination)) {
      const { total = 0 } = originRefs.response;
      const { page, pageSize } = refsPagination;

      return {
        ...getPagingOptions(pageSize),
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

  const props: DefaultListProps<I | T> = {
    loading,
    dataSource,
    pagination
  };

  return [props, fetch, dispatch as Dispatch<I[] | T[]>, refs];
}
