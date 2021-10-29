/**
 * @module usePagingRequest
 */

import React, { useCallback, useMemo, useRef, useState } from 'react';

import { message } from 'antd';
import usePersistRef from './usePersistRef';
import { RequestError } from '~js/utils/request';
import useRequest, { Options as UseRequestOptions } from './useRequest';

interface BaseResponse<I> {
  // 数据项
  readonly items?: I[];
  // 数据总条数
  readonly total?: number;
}

type RefValue<R> = R extends React.MutableRefObject<infer V> ? V : never;

export type Query = Search & Partial<Pagination>;

export type Response<I, E = {}> = BaseResponse<I> & Partial<Omit<E, keyof BaseResponse<I>>>;

export interface Search {
  [name: string]: any;
  [name: number]: any;
}

export interface Pagination {
  page: number;
  pageSize: number;
}

export interface Options extends Omit<UseRequestOptions, 'body' | 'method'> {
  onError?: (error: RequestError) => void;
  pagination?: Partial<Pagination> | false;
}

export interface TransformOptions<I, T> extends Options {
  transform: (items: I[]) => T[];
}

export interface RequestOptions extends Omit<Options, 'query'> {
  search?: Search | false;
}

export interface Refs<I, E = {}> {
  readonly search: Search | false;
  readonly response: Response<I, E>;
  readonly pagination: Pagination | false;
}

export const DEFAULT_PAGINATION: Pagination = { page: 1, pageSize: 20 };

export function hasQuery<Q>(query: Q | false): query is Q {
  return query !== false;
}

export function setRef<R extends React.MutableRefObject<any>, V extends RefValue<R>>(ref: R, current: V): V {
  return (ref.current = current);
}

export function updateRef<R extends React.MutableRefObject<any>, V extends RefValue<R>>(ref: R, value: V | undefined): V {
  return setRef(ref, value ?? ref.current);
}

/**
 * @function usePagingRequest
 * @description [hook] 分页请求
 * @param url 请求地址
 * @param options 请求配置
 * @param initialLoadingState 初始加载状态
 */
export default function usePagingRequest<I>(
  url: string,
  options?: Options,
  initialLoadingState?: boolean
): [loading: boolean, dataSource: I[], fetch: (options?: RequestOptions) => Promise<void>, refs: Refs<I>];
/**
 * @function usePagingRequest
 * @description [hook] 分页请求
 * @param url 请求地址
 * @param options 请求配置
 * @param initialLoadingState 初始加载状态
 */
export default function usePagingRequest<I, E>(
  url: string,
  options?: Options,
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
  options: Options | TransformOptions<I, T> = {},
  initialLoadingState: boolean | (() => boolean) = false
): [loading: boolean, dataSource: I[] | T[], fetch: (options?: RequestOptions) => Promise<void>, refs: Refs<I, E>] {
  const initPagination = useMemo(() => {
    const { pagination } = options;

    if (pagination === false) return pagination as false;

    return { ...DEFAULT_PAGINATION, ...pagination };
  }, []);

  const initOptionsRef = usePersistRef(options);
  const responseRef = useRef<Response<I, E>>({});
  const searchRef = useRef<Search | false>(false);
  const { transform } = options as TransformOptions<I, T>;
  const [dataSource, setDataSource] = useState<I[] | T[]>([]);
  const paginationRef = useRef<Pagination | false>(initPagination);
  const [loading, request] = useRequest(options, initialLoadingState);

  const fetch = useCallback(async (options: RequestOptions = {}) => {
    const { search, pagination } = options;
    const { query: initQuery } = initOptionsRef.current;
    const hasPagination = hasQuery(pagination ?? paginationRef.current);
    const query: Query = { ...initQuery, ...updateRef(searchRef, { ...search }) };

    if (hasPagination) {
      const { page, pageSize }: Pagination = {
        ...DEFAULT_PAGINATION,
        ...initPagination,
        ...paginationRef.current,
        ...pagination
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

      setRef(paginationRef, { page, pageSize });
    } else {
      setRef(paginationRef, false);
    }

    return request<Response<I, E>>(url, { ...options, query }).then(
      response => {
        const { items }: Response<I, E> = response;
        const dataSource = Array.isArray(items) ? items : [];

        if (hasPagination) {
          const { total = 0 } = response;
          const { page: current, pageSize } = paginationRef.current as Pagination;
          const page = Math.max(1, Math.min(current, Math.ceil(total / pageSize)));

          if (page !== current) {
            setRef(paginationRef, { page, pageSize });
          }
        }

        setRef(responseRef, response);
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
    );
  }, []);

  const refs = useMemo<Refs<I, E>>(() => {
    return {
      get search() {
        return searchRef.current;
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
