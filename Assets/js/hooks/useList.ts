import { useCallback } from 'react';

import { PaginationProps } from 'antd';
import usePagingOptions, { Options } from './usePagingOptions';
import usePagingRequest, { hasQuery, Options as RequestOptions, Refs, Response } from './usePagingRequest';

type OnChange = NonNullable<PaginationProps['onChange']>;

export type { Options };

export default function useList<I, E extends object = {}>(
  url: string,
  options?: Options
): [
  loading: boolean,
  dataSource: I[],
  fetch: (options?: RequestOptions) => Promise<Response<I, E>>,
  pagination: PaginationProps | false,
  refs: Refs<I, E>
] {
  const resolvePagingOptions = usePagingOptions(options);
  const [loading, dataSource, fetch, refs] = usePagingRequest<I, E>(url);

  const onChange = useCallback<OnChange>((page, pageSize) => {
    fetch({ pagination: { page, pageSize } });
  }, []);

  const refsPagination = refs.pagination;

  let pagination: PaginationProps | false = false;

  if (hasQuery(refsPagination)) {
    const { total = 0 } = refs.response;
    const { page, pageSize } = refsPagination;

    pagination = {
      total,
      pageSize,
      onChange,
      current: page,
      onShowSizeChange: onChange,
      ...resolvePagingOptions(pageSize)
    };
  }

  return [loading, dataSource, fetch, pagination, refs];
}
