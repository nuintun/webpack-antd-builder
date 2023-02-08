/**
 * @module useAction
 */

import { useCallback } from 'react';
import { isFunction } from '../utils/utils';
import useLatestRef from './useLatestRef';
import useRequest, { RequestOptions } from './useRequest';
import { Body, Query } from '/js/utils/request';

type RequestPicked = 'query' | 'body' | 'method' | 'notify' | 'onError' | 'onSuccess' | 'onComplete';

export interface Options<R> extends Pick<RequestOptions<R>, RequestPicked> {
  delay?: number;
  action: string;
  body?: (() => Body) | Body;
  query?: (() => Query) | Query;
  requestInit?: Omit<RequestOptions<R>, RequestPicked>;
}

export default function useAction<R>(options: Options<R>): [loading: boolean, onAction: () => void] {
  const { delay } = options;

  const optionsRef = useLatestRef(options);
  const [loading, request] = useRequest({ delay }, false);

  const onAction = useCallback(() => {
    const {
      action,
      notify,
      onError,
      onSuccess,
      onComplete,
      requestInit,
      method = 'PUT',
      body: initBody,
      query: initQuery
    } = optionsRef.current;

    const isBlobBody = initBody instanceof Blob;
    const query = isFunction(initQuery) ? initQuery() : initQuery;
    const body = !isBlobBody && isFunction(initBody) ? initBody() : initBody;

    request<R>(action, { ...requestInit, body, query, method, notify, onError, onSuccess, onComplete });
  }, []);

  return [loading, onAction];
}
