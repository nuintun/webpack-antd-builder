/**
 * @module usePagingRequest
 */

import { useCallback, useMemo, useRef, useState } from 'react';

import { message } from 'antd';
import useSearches from './useSearches';
import usePersistRef from './usePersistRef';
import { Query, RequestError } from '/js/utils/request';
import useRequest, { Options as UseRequestOptions } from './useRequest';

interface BaseResponse<I> {
  // 数据项
  readonly items?: I[];
  // 数据总条数
  readonly total?: number;
}

export type Search = Query;

export interface Pagination {
  page: number;
  pageSize: number;
}

export interface Sorter {
  orderBy: (string | number)[];
  orderType: ('ascend' | 'descend')[];
}

export interface Options<I> extends Omit<UseRequestOptions, 'body' | 'method'> {
  onComplete?: () => void;
  onError?: (error: RequestError) => void;
  pagination?: Partial<Pagination> | false;
  onSuccess?: (response: BaseResponse<I>) => void;
}

export interface TransformOptions<I, T> extends Options<I> {
  transform: (items: I[]) => T[];
}

export interface RequestOptions extends Omit<UseRequestOptions, 'body' | 'method' | 'onUnauthorized'> {
  search?: Search | false;
  pagination?: Partial<Pagination> | false;
}

export type Response<I, E = {}> = BaseResponse<I> & Partial<Omit<E, keyof BaseResponse<I>>>;

export interface Refs<I, E = {}> {
  readonly search: Search | false;
  readonly response: Response<I, E>;
  readonly pagination: Pagination | false;
}

/**
 * @function hasQuery
 * @param query 参数配置
 */
export function hasQuery<Q>(query: Q | false): query is Q {
  return query !== false;
}

export const DEFAULT_PAGINATION: Pagination = { page: 1, pageSize: 20 };

/**
 * @function usePagingRequest
 * @description [hook] 分页请求
 * @param url 请求地址
 * @param options 请求配置
 * @param initialLoadingState 初始加载状态
 */
export default function usePagingRequest<I, E = {}>(
  url: string,
  options?: Options<I>,
  initialLoadingState?: boolean | (() => boolean)
): [loading: boolean, dataSource: I[], fetch: (options?: RequestOptions) => Promise<void>, refs: Refs<I, E>];
/**
 * @function usePagingRequest
 * @description [hook] 分页请求
 * @param url 请求地址
 * @param options 请求配置
 * @param initialLoadingState 初始加载状态
 */
export default function usePagingRequest<I, E, T>(
  url: string,
  options: TransformOptions<I, T>,
  initialLoadingState?: boolean | (() => boolean)
): [loading: boolean, dataSource: T[], fetch: (options?: RequestOptions) => Promise<void>, refs: Refs<I, E>];
export default function usePagingRequest<I, E, T>(
  url: string,
  options: Options<I> | TransformOptions<I, T> = {},
  initialLoadingState: boolean | (() => boolean) = false
): [loading: boolean, dataSource: I[] | T[], fetch: (options?: RequestOptions) => Promise<void>, refs: Refs<I, E>] {
  const initPagination = useMemo(() => {
    const { pagination } = options;

    if (pagination === false) return pagination as false;

    return { ...DEFAULT_PAGINATION, ...pagination };
  }, []);

  const initURLRef = usePersistRef(url);
  const responseRef = useRef<Response<I, E>>({});
  const [serialize, raw] = useSearches<[Search]>([false]);
  const [dataSource, setDataSource] = useState<I[] | T[]>([]);
  const paginationRef = useRef<Pagination | false>(initPagination);
  const [loading, request] = useRequest(options, initialLoadingState);
  const initOptionsRef = usePersistRef(options as TransformOptions<I, T>);

  const fetch = useCallback((options: RequestOptions = {}) => {
    const hasPagination = hasQuery(paginationRef.current);
    const { query: initQuery, onComplete } = initOptionsRef.current;
    const query: Search = { ...initQuery, ...serialize([options.search]) };

    if (hasPagination) {
      const { page, pageSize }: Pagination = {
        ...DEFAULT_PAGINATION,
        ...initPagination,
        ...paginationRef.current,
        ...options.pagination
      };

      if (__DEV__) {
        if (page < 1 || !Number.isInteger(page)) {
          throw new RangeError('page must be an integer of no less than 1');
        }

        if (pageSize < 1 || !Number.isInteger(pageSize)) {
          throw new RangeError('page size must be an integer of no less than 1');
        }
      }

      query.page = page;
      query.pageSize = pageSize;
      paginationRef.current = { page, pageSize };
    } else {
      paginationRef.current = false;
    }

    return request<Response<I, E>>(initURLRef.current, { ...options, query })
      .then(
        response => {
          const { items }: Response<I, E> = response;
          const dataSource = Array.isArray(items) ? items : [];
          const { transform, onSuccess } = initOptionsRef.current;

          responseRef.current = response;

          onSuccess && onSuccess(response);

          if (hasPagination) {
            const { total = 0 } = response;
            const { page: current, pageSize } = paginationRef.current as Pagination;
            const page = Math.max(1, Math.min(current, Math.ceil(total / pageSize)));

            if (page !== current) {
              paginationRef.current = { page, pageSize };
            }
          }

          setDataSource(transform ? transform(dataSource) : dataSource);
        },
        error => {
          const { onError } = initOptionsRef.current;

          setDataSource([]);

          if (onError) {
            onError(error);
          } else {
            message.error(error.message);
          }
        }
      )
      .finally(onComplete);
  }, []);

  const refs = useMemo<Refs<I, E>>(() => {
    return {
      get search() {
        const [search] = raw();

        return search;
      },
      get response() {
        return responseRef.current;
      },
      get pagination() {
        return paginationRef.current;
      }
    };
  }, []);

  return [loading, dataSource, fetch, refs];
}
