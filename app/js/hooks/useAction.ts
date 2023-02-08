/**
 * @module useAction
 */

import { useCallback } from 'react';
import { isFunction } from '../utils/utils';
import useLatestRef from './useLatestRef';
import useRequest, { RequestOptions } from './useRequest';

export interface Options<R> extends RequestOptions<R> {
  delay?: number;
  action: string;
}

export default function useAction<R>(
  action: string,
  requestInit: RequestOptions<R>,
  delay?: number
): [loading: boolean, onAction: () => void] {
  const actionRef = useLatestRef(action);
  const requestInitRef = useLatestRef(requestInit);
  const [loading, request] = useRequest({ delay }, false);

  const onAction = useCallback(() => {
    const { current: requestInit } = requestInitRef;
    const { method = 'PUT', body: initBody, query: initQuery } = requestInit;

    const isBlobBody = initBody instanceof Blob;
    const query = isFunction(initQuery) ? initQuery() : initQuery;
    const body = !isBlobBody && isFunction(initBody) ? initBody() : initBody;

    request<R>(actionRef.current, { ...requestInit, body, query, method });
  }, []);

  return [loading, onAction];
}
