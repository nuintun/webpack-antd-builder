import React, { useMemo, useRef, useState } from 'react';

import useRequest from './useRequest';
import usePersistCallback from './usePersistCallback';

export interface Search {
  [name: string]: any;
  [name: number]: any;
}

export interface Pagination {
  page: number;
  pageSize: number;
}

export interface Options {
  search?: Search | false;
  pagination?: Partial<Pagination> | false;
}

export type Query = Search & Partial<Pagination>;

export interface Refs<I, E> {
  readonly search: Search | false;
  readonly response: Response<I, E>;
  readonly pagination: Pagination | false;
}

interface BaseResponse<I> {
  // 数据项
  readonly items?: I[];
  // 数据总条数
  readonly total?: number;
}

export type Response<I, E> = BaseResponse<I> & Partial<Omit<E, keyof BaseResponse<I>>>;

type RefValue<R> = R extends React.MutableRefObject<infer V> ? V : never;

export function setRef<R extends React.MutableRefObject<any>, V extends RefValue<R>>(ref: R, current: V): V {
  return (ref.current = current);
}

export function getAndUpdateRef<R extends React.MutableRefObject<any>, V extends RefValue<R>>(ref: R, value: V | undefined): V {
  return setRef(ref, value ?? ref.current);
}

export function hasQuery<Q>(query: Q | false): query is Q {
  return query !== false;
}

const DEFAULT_PAGINATION: Pagination = { page: 1, pageSize: 20 };

export default function usePagingRequest<I, E extends object = {}>(
  url: string
): [loading: boolean, dataSource: I[], fetch: (options?: Options) => Promise<Response<I, E>>, refs: Refs<I, E>] {
  const [loading, request] = useRequest();
  const payloadRef = useRef<Response<I, E>>({});
  const searchRef = useRef<Search | false>(false);
  const [dataSource, setDataSource] = useState<I[]>([]);
  const paginationRef = useRef<Pagination | false>(DEFAULT_PAGINATION);

  const fetch = usePersistCallback(async (options: Options = {}) => {
    const query: Query = getAndUpdateRef(searchRef, options.search) || {};
    const hasPagination = hasQuery(options.pagination ?? paginationRef.current);

    if (hasPagination) {
      const pagination: Pagination = {
        ...DEFAULT_PAGINATION,
        ...paginationRef.current,
        ...options.pagination
      };

      query.page = pagination.page;
      query.pageSize = pagination.pageSize;

      setRef(paginationRef, pagination);
    } else {
      setRef(paginationRef, false);
    }

    try {
      setRef(
        payloadRef,
        await request<Response<I, E>>(url, { query })
      );
    } catch (error) {
      setDataSource([]);

      throw error;
    }

    const response = payloadRef.current;
    const { items }: Response<I, E> = response;
    const dataSource = Array.isArray(items) ? items : [];

    if (hasPagination) {
      const { total = 0 } = response;
      const { page: current, pageSize } = paginationRef.current as Pagination;
      const page = Math.min(current, Math.ceil(total / Math.max(1, pageSize)));

      if (page !== current) {
        setRef(paginationRef, { page, pageSize });
      }
    }

    setDataSource(dataSource);

    return payloadRef.current;
  });

  const refs = useMemo<Refs<I, E>>(() => {
    return {
      get response() {
        return payloadRef.current;
      },
      get search() {
        return searchRef.current;
      },
      get pagination() {
        return paginationRef.current;
      }
    };
  }, []);

  return [loading, dataSource, fetch, refs];
}
