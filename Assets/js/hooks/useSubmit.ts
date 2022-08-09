/**
 * @module useSubmit
 */

import { useCallback } from 'react';

import usePersistRef from './usePersistRef';
import { RequestError } from '/js/utils/request';
import useRequest, { RequestOptions } from './useRequest';

type OmitProps = 'body' | 'onError' | 'onSuccess' | 'onComplete';

export interface Options<V, R> extends Omit<RequestOptions<R>, OmitProps> {
  delay?: number;
  normalize?: <T>(values: V) => T;
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
export default function useSubmit<V, R = unknown>(
  url: string,
  options: Options<V, R> = {},
  initialLoadingState: boolean | (() => boolean) = false
): [loading: boolean, onSubmit: (values: V) => void] {
  const initURLRef = usePersistRef(url);
  const initOptionsRef = usePersistRef(options);
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
        ...params
      };
    } else {
      options.body = params;
    }

    request<R>(initURLRef.current, options);
  }, []);

  return [loading, onSubmit];
}
