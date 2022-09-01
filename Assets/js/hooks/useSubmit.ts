/**
 * @module useSubmit
 */

import { useCallback } from 'react';

import useSyncRef from './useSyncRef';
import useRequest, { RequestOptions } from './useRequest';
import { Body, Query, RequestError } from '/js/utils/request';

export type Values = Query | Body;

type OmitProps = 'body' | 'onError' | 'onSuccess' | 'onComplete';

export interface Options<V extends Values, R> extends Omit<RequestOptions<R>, OmitProps> {
  delay?: number;
  normalize?: (values: V) => any;
  onComplete?: (values: V) => void;
  onSuccess?: (response: R, values: V) => void;
  onError?: (error: RequestError<R>, values: V) => void;
}

/**
 * @function useSubmit
 * @description [hook] 提交操作
 * @param url 提交地址
 * @param options 请求配置
 * @param initialLoadingState 初始加载状态
 */
export default function useSubmit<V extends Values, R = unknown>(
  url: string,
  options: Options<V, R> = {},
  initialLoadingState: boolean | (() => boolean) = false
): [loading: boolean, onSubmit: (values: V) => void] {
  const initURLRef = useSyncRef(url);
  const initOptionsRef = useSyncRef(options);
  const [loading, request] = useRequest(options, initialLoadingState);

  const onSubmit = useCallback((values: V) => {
    const initOptions = initOptionsRef.current;
    const { method = 'POST', normalize } = initOptions;
    const params: V = normalize ? normalize(values) : values;

    const options: RequestOptions<R> = {
      ...initOptions,
      method,
      onError(error) {
        initOptions.onError?.(error, values);
      },
      onSuccess(response) {
        initOptions.onSuccess?.(response, values);
      },
      onComplete() {
        initOptions.onComplete?.(values);
      }
    };

    if (/^(?:GET|HEAD)$/i.test(method)) {
      options.query = {
        ...options.query,
        ...(params as Query)
      };
    } else {
      options.body = params as Body;
    }

    request<R>(initURLRef.current, options);
  }, []);

  return [loading, onSubmit];
}
