/**
 * @module usePagingRequest
 */

import { App } from 'antd';
import useLatestRef from './useLatestRef';
import useSearches, { Search } from './useSearches';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import useRequest, { Options as InitOptions, RequestOptions as RequestInit } from './useRequest';

const { useApp } = App;

export interface Page<I> {
  // 数据项
  readonly items?: I[];
  // 数据总条数
  readonly total?: number;
}

export interface Pagination {
  page: number;
  pageSize: number;
}

export interface Transform<I, T> {
  (items: I[]): T[];
}

export interface Fetch {
  (options?: RequestOptions): void;
}

export interface Sorter {
  orderBy: React.Key[];
  orderType: ('ascend' | 'descend')[];
}

export interface Refs<I, E> {
  readonly search: Search | false;
  readonly response: Response<I, E>;
  readonly pagination: Pagination | false;
}

export type Response<I, E> = Page<I> & Partial<Omit<E, keyof Page<I>>>;

export interface Options<I, E, T> extends Omit<RequestInit<Response<I, E>>, 'body' | 'method'> {
  delay?: number;
  transform?: Transform<I, T>;
  pagination?: Partial<Pagination> | false;
}

export interface RequestOptions extends Omit<InitOptions, 'body' | 'delay' | 'method' | 'onUnauthorized'> {
  search?: Search | false;
  pagination?: Partial<Pagination> | false;
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
export default function usePagingRequest<I, E>(
  url: string,
  options?: Options<I, E, I>,
  initialLoadingState?: boolean | (() => boolean)
): [loading: boolean, dataSource: I[], fetch: Fetch, refs: Refs<I, E>];
/**
 * @function usePagingRequest
 * @description [hook] 分页请求
 * @param url 请求地址
 * @param options 请求配置
 * @param initialLoadingState 初始加载状态
 */
export default function usePagingRequest<I, E, T>(
  url: string,
  options: Options<I, E, T> & { transform: Transform<I, T> },
  initialLoadingState?: boolean | (() => boolean)
): [loading: boolean, dataSource: T[], fetch: Fetch, refs: Refs<I, E>];
/**
 * @function usePagingRequest
 * @description [hook] 分页请求
 * @param url 请求地址
 * @param options 请求配置
 * @param initialLoadingState 初始加载状态
 */
export default function usePagingRequest<I, E, T>(
  url: string,
  options: Options<I, E, T> = {},
  initialLoadingState: boolean | (() => boolean) = false
): [loading: boolean, dataSource: I[] | T[], fetch: Fetch, refs: Refs<I, E>] {
  const initPagination = useMemo(() => {
    const { pagination } = options;

    if (pagination === false) {
      return pagination;
    }

    return { ...DEFAULT_PAGINATION, ...pagination };
  }, []);

  const { message } = useApp();
  const urlRef = useLatestRef(url);
  const opitonsRef = useLatestRef(options);
  const responseRef = useRef<Response<I, E>>({});
  const [serialize, raw] = useSearches<[Search]>([false]);
  const [dataSource, setDataSource] = useState<I[] | T[]>([]);
  const paginationRef = useRef<Pagination | false>(initPagination);
  const [loading, request] = useRequest(options, initialLoadingState);

  const fetch = useCallback((options: RequestOptions = {}): void => {
    const requestInit = {
      ...opitonsRef.current,
      ...options
    };

    const { query: initQuery } = requestInit;
    const hasPagination = hasQuery(paginationRef.current);
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

    request<Response<I, E>>(urlRef.current, {
      ...requestInit,
      query,
      onSuccess(response) {
        const { transform } = requestInit;
        const { items }: Response<I, E> = response;
        const dataSource = Array.isArray(items) ? items : [];

        responseRef.current = response;

        requestInit.onSuccess?.(response);

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
      onError(error) {
        setDataSource([]);

        const { onError } = requestInit;

        if (onError) {
          onError(error);
        } else {
          message.error(error.message);
        }
      }
    });
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
