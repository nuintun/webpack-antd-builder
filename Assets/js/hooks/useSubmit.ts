/**
 * @module useSubmit
 */

import { useCallback } from 'react';

import { message } from 'antd';
import useLatestRef from './useLatestRef';
import useRequest, { RequestOptions } from './useRequest';
import { Body, Query, RequestError } from '/js/utils/request';

export type Values = Query | Body;

type OmitProps = 'body' | 'onError' | 'onSuccess' | 'onComplete';

export interface Options<V extends Values, R> extends Omit<RequestOptions<R>, OmitProps> {
  delay?: number;
  onComplete?: (values: V) => void;
  normalize?: (values: V) => Values;
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
  const opitonsRef = useLatestRef(options);
  const [loading, request] = useRequest(options, initialLoadingState);

  const onSubmit = useCallback((values: V) => {
    const { current: initOptions } = opitonsRef;
    const { method = 'POST', normalize } = initOptions;
    const params = normalize ? normalize(values) : values;

    const options: RequestOptions<R> = {
      ...initOptions,
      method,
      onSuccess(response) {
        initOptions.onSuccess?.(response, values);
      },
      onError(error) {
        const { onError } = initOptions;

        if (onError) {
          onError(error, values);
        } else {
          message.error(error.message);
        }
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

    request<R>(url, options);
  }, []);

  return [loading, onSubmit];
}
