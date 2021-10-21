/**
 * @module usePagingRequest
 */

import React, { useMemo, useRef, useState } from 'react';

import useRequest from './useRequest';
import usePersistCallback from './usePersistCallback';
import { Options as RequestOptions } from '~js/utils/request';

type RefValue<R> = R extends React.MutableRefObject<infer V> ? V : never;

interface BaseResponse<I> {
  // 数据项
  readonly items?: I[];
  // 数据总条数
  readonly total?: number;
}

const DEFAULT_PAGINATION: Pagination = { page: 1, pageSize: 20 };

export type Query = Search & Partial<Pagination>;

export type Response<I, E> = BaseResponse<I> & Partial<Omit<E, keyof BaseResponse<I>>>;

export interface Search {
  [name: string]: any;
  [name: number]: any;
}

export interface Pagination {
  page: number;
  pageSize: number;
}

export interface Options extends Omit<RequestOptions, 'body' | 'query' | 'method'> {
  search?: Search | false;
  pagination?: Partial<Pagination> | false;
}

export interface Refs<I, E> {
  readonly search: Search | false;
  readonly response: Response<I, E>;
  readonly pagination: Pagination | false;
}

export function setRef<R extends React.MutableRefObject<any>, V extends RefValue<R>>(ref: R, current: V): V {
  return (ref.current = current);
}

export function updateRef<R extends React.MutableRefObject<any>, V extends RefValue<R>>(ref: R, value: V | undefined): V {
  return setRef(ref, value ?? ref.current);
}

export function hasQuery<Q>(query: Q | false): query is Q {
  return query !== false;
}

/**
 * @function usePagingRequest
 * @description [hook] 分页请求
 * @param url 请求地址
 * @param transform 数据转换函数
 */
export default function usePagingRequest<I, E extends object = {}, T = I>(
  url: string,
  transform: (items: I[]) => T[] = items => items as unknown as T[]
): [loading: boolean, dataSource: T[], fetch: (options?: Options) => Promise<Response<I, E>>, refs: Refs<I, E>] {
  const [loading, request] = useRequest();
  const responseRef = useRef<Response<I, E>>({});
  const searchRef = useRef<Search | false>(false);
  const [dataSource, setDataSource] = useState<T[]>([]);
  const paginationRef = useRef<Pagination | false>(DEFAULT_PAGINATION);

  const fetch = usePersistCallback(async ({ search, pagination, ...options }: Options = {}) => {
    const query: Query = { ...updateRef(searchRef, { ...search }) };
    const hasPagination = hasQuery(pagination ?? paginationRef.current);

    if (hasPagination) {
      const { page, pageSize }: Pagination = {
        ...DEFAULT_PAGINATION,
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

    try {
      setRef(responseRef, await request<Response<I, E>>(url, { ...options, query }));
    } catch (error) {
      setDataSource([]);

      throw error;
    }

    const response = responseRef.current;
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

    setDataSource(transform(dataSource));

    return responseRef.current;
  });

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
