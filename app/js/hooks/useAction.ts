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

export default function useAction<R>(options: Options<R>): [loading: boolean, onAction: () => void] {
  const { delay } = options;

  const optionsRef = useLatestRef(options);
  const [loading, request] = useRequest({ delay }, false);

  const onAction = useCallback(() => {
    const { action, method = 'PUT', body: initBody, query: initQuery, ...requestInit } = optionsRef.current;

    const isBlobBody = initBody instanceof Blob;
    const query = isFunction(initQuery) ? initQuery() : initQuery;
    const body = !isBlobBody && isFunction(initBody) ? initBody() : initBody;

    request<R>(action, { ...requestInit, body, query, method });
  }, []);

  return [loading, onAction];
}
