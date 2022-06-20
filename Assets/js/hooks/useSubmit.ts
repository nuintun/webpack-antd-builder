/**
 * @module useSubmit
 */

import { useCallback } from 'react';

import { message } from 'antd';
import usePersistRef from './usePersistRef';
import { RequestError } from '/js/utils/request';
import useRequest, { Options as RequestOptions } from './useRequest';

export interface Options<V, R> extends Omit<RequestOptions, 'body'> {
  normalize?: (values: V) => any;
  onComplete?: (values: V) => void;
  onSuccess?: (response: R, values: V) => void;
  onError?: (error: RequestError, values: V) => void;
}

/**
 * @function useSubmit
 * @description [hook] 提交操作
 * @param url 提交地址
 * @param options 请求配置
 * @param initialLoadingState 初始加载状态
 */
export default function useSubmit<V, R = unknown>(
  url: string,
  options: Options<V, R> = {},
  initialLoadingState: boolean | (() => boolean) = false
): [loading: boolean, onSubmit: (values: V) => void] {
  const initURLRef = usePersistRef(url);
  const initOptionsRef = usePersistRef(options);
  const [loading, request] = useRequest(options, initialLoadingState);

  const onSubmit = useCallback((values: V) => {
    const options = initOptionsRef.current;
    const { method = 'POST', normalize } = options;
    const params = normalize ? normalize(values) : values;
    const requestOptions: RequestOptions = { ...options, method };

    if (/^(?:GET|HEAD)$/i.test(method)) {
      requestOptions.query = { ...requestOptions.query, ...params };
    } else {
      requestOptions.body = params;
    }

    return request<R>(initURLRef.current, requestOptions)
      .then(
        response => {
          const { onSuccess } = initOptionsRef.current;

          onSuccess && onSuccess(response, values);
        },
        error => {
          const { onError } = initOptionsRef.current;

          if (onError) {
            onError(error, values);
          } else {
            message.error(error.message);
          }
        }
      )
      .finally(() => {
        const { onComplete } = initOptionsRef.current;

        onComplete && onComplete(values);
      });
  }, []);

  return [loading, onSubmit];
}
