/**
 * @module useSubmit
 */

import { message } from 'antd';
import useRequest from './useRequest';
import usePersistCallback from './usePersistCallback';
import { Options as RequestOptions, RequestError } from '~js/utils/request';

export interface Options<V, R> extends Omit<RequestOptions, 'body'> {
  delay?: number;
  transform?: (values: V) => any;
  onComplete?: (values: V) => void;
  onSuccess?: (response: R, values: V) => void;
  onError?: (error: RequestError, values: V) => void;
}

/**
 * @function useSubmit
 * @description 【Hook】提交操作
 * @param url 提交地址
 * @param options 请求配置
 */
export default function useSubmit<V, R>(
  url: string,
  options: Options<V, R> = {}
): [submitting: boolean, onSubmit: (values: V) => void] {
  const { delay, onError, method = 'POST', transform, onSuccess, onComplete, ...requestOptions } = options;

  const [submitting, request] = useRequest(delay);

  const onSubmit = usePersistCallback(async (values: V) => {
    const body = transform ? transform(values) : values;

    try {
      const response = await request<R>(url, { ...requestOptions, method, body });

      onSuccess && onSuccess(response, values);
    } catch (error) {
      onError ? onError(error, values) : message.error(error.message);
    }

    onComplete && onComplete(values);
  });

  return [submitting, onSubmit];
}
