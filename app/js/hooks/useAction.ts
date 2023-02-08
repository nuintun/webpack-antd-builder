/**
 * @module useAction
 */

import { useCallback } from 'react';
import { isFunction } from '../utils/utils';
import useLatestRef from './useLatestRef';
import useRequest, { RequestOptions } from './useRequest';

export interface Options<R> extends RequestOptions<R> {
  delay?: number;
}

export default function useAction<R>(action: string, options: Options<R>): [loading: boolean, onAction: () => void] {
  const { delay } = options;
  const actionRef = useLatestRef(action);
  const optionsRef = useLatestRef(options);
  const [loading, request] = useRequest({ delay }, false);

  const onAction = useCallback(() => {
    const { current: options } = optionsRef;
    const { method = 'PUT', body: initBody, query: initQuery } = options;

    const isBlobBody = initBody instanceof Blob;
    const query = isFunction(initQuery) ? initQuery() : initQuery;
    const body = !isBlobBody && isFunction(initBody) ? initBody() : initBody;

    request<R>(actionRef.current, { ...options, body, query, method });
  }, []);

  return [loading, onAction];
}
