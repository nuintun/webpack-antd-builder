/**
 * @module useSubmit
 */

import useStableCallback from './useStableCallback';
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
  const initOptions = options;

  const [loading, request] = useRequest(options, initialLoadingState);

  const onSubmit = useStableCallback((values: V) => {
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

    request<R>(url, options);
  });

  return [loading, onSubmit];
}
