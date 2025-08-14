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
import useSearchFilters from './useSearchFilters';
import { Query as Filter } from '/js/utils/request';
import { normalize, SortOrder } from '/js/utils/sorter';
import { GetProp, ListProps, PaginationProps } from 'antd';
import usePagingOptions, { Options as PagingOptions } from './usePagingOptions';

export interface Fetch {
  (options?: RequestOptions): void;
}

type ListPropsPicked = 'dataSource' | 'pagination';

export interface RequestOptions extends RequestInit {
  filter?: Filter | false;
  sorter?: SortOrder[] | false;
}

export type OnChange = GetProp<PaginationProps, 'onChange'>;

export interface Options<I, E, T> extends InitOptions<I, E, T> {
  pagination?: Pagination | false;
}

export interface Refs<I, E> extends RequestRefs<I, E> {
  readonly filters: Filters;
}

type Filters = [filter: Filter | false, sorter: SortOrder[] | false];

type ListPagination = Exclude<GetProp<ListProps<unknown>, 'pagination'>, false>;

export interface DefaultListProps<I> extends Required<Pick<ListProps<I>, ListPropsPicked>> {
  loading: boolean;
}

export type Pagination = Omit<PagingOptions & Partial<RequestPagination> & ListPagination, 'current'>;

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
  const [getFilters, updateFilters] = useSearchFilters<Filters>([false, false]);

  const [loading, dataSource, request, dispatch, originRefs] = usePagingRequest(
    url,
    options as Options<I, E, I>,
    initialLoadingState
  );

  const fetch = useCallback<Fetch>((options = {}) => {
    updateFilters([options.filter, options.sorter]);

    const { current: initOptions } = opitonsRef;
    const [filter, sorter] = getFilters();

    request({
      ...opitonsRef.current,
      ...options,
      query: {
        ...initOptions.query,
        ...options.query,
        ...filter,
        ...normalize(sorter)
      }
    });
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
        return getFilters();
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
