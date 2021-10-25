/**
 * @module useSubmit
 */

import { message } from 'antd';
import { RequestError } from '~js/utils/request';
import usePersistCallback from './usePersistCallback';
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
 * @param initialSubmittingState 初始提交状态
 */
export default function useSubmit<V, R>(
  url: string,
  options: Options<V, R> = {},
  initialSubmittingState: boolean | (() => boolean) = false
): [submitting: boolean, onSubmit: (values: V) => void] {
  const { onError, method = 'POST', normalize, onSuccess, onComplete } = options;

  const [submitting, request] = useRequest(initialSubmittingState, options);

  const onSubmit = usePersistCallback(async (values: V) => {
    const params = normalize ? normalize(values) : values;
    const requestOptions: RequestOptions = { ...options, method };

    if (/^(?:GET|HEAD)$/i.test(method)) {
      requestOptions.query = { ...requestOptions.query, ...params };
    } else {
      requestOptions.body = params;
    }

    try {
      const response = await request<R>(url, requestOptions);

      onSuccess && onSuccess(response, values);
    } catch (error) {
      onError ? onError(error, values) : message.error(error.message);
    }

    onComplete && onComplete(values);
  });

  return [submitting, onSubmit];
}
