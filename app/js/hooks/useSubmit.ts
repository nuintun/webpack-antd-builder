/**
 * @module useSubmit
 */

import { App } from 'antd';
import { Fields } from '/js/utils/form';
import { RequestError } from '/js/utils/request';
import useLatestCallback from './useLatestCallback';
import useRequest, { RequestOptions } from './useRequest';

const { useApp } = App;

type OmitProps = 'body' | 'onError' | 'onSuccess' | 'onComplete';

export interface Options<F extends Fields | null, R> extends Omit<RequestOptions<R>, OmitProps> {
  delay?: number;
  onComplete?: (fields: F) => void;
  normalize?: (fields: F) => Fields;
  onSuccess?: (response: R, fields: F) => void;
  onError?: (error: RequestError, fields: F) => void;
}

/**
 * @function useSubmit
 * @description [hook] 提交操作
 * @param url 提交地址
 * @param options 请求配置
 * @param initialLoadingState 初始加载状态
 */
export default function useSubmit<F extends Fields | null, R = unknown>(
  url: string,
  options: Options<F, R> = {},
  initialLoadingState: boolean | (() => boolean) = false
): [loading: boolean, onSubmit: (fields: F) => void] {
  const { message } = useApp();
  const [loading, request] = useRequest(options, initialLoadingState);

  const onSubmit = useLatestCallback((fields: F): void => {
    const { method = 'POST', normalize } = options;
    const params = normalize ? normalize(fields) : fields;

    const requestInit: RequestOptions<R> = {
      ...options,
      method,
      onSuccess(response) {
        options.onSuccess?.(response, fields);
      },
      onError(error) {
        const { onError } = options;

        if (onError) {
          onError(error, fields);
        } else {
          message.error(error.message);
        }
      },
      onComplete() {
        options.onComplete?.(fields);
      }
    };

    if (/^(?:GET|HEAD|TRACE|CONNECT)$/i.test(method)) {
      requestInit.query = { ...requestInit.query, ...params };
    } else {
      requestInit.body = params;
    }

    request<R>(url, requestInit);
  });

  return [loading, onSubmit];
}
