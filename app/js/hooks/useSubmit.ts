/**
 * @module useSubmit
 */

import { App } from 'antd';
import { useCallback } from 'react';
import { Fields } from '/js/utils/form';
import useLatestRef from './useLatestRef';
import { RequestError } from '/js/utils/request';
import useRequest, { RequestOptions } from './useRequest';

const { useApp } = App;

type OmitProps = 'body' | 'onError' | 'onSuccess' | 'onComplete';

export interface Options<F extends Fields | null, R> extends Omit<RequestOptions<R>, OmitProps> {
  delay?: number;
  onComplete?: (fields: F) => void;
  normalize?: (fields: F) => Fields;
  onSuccess?: (response: R, fields: F) => void;
  onError?: (error: RequestError<R>, fields: F) => void;
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
  const urlRef = useLatestRef(url);
  const opitonsRef = useLatestRef(options);
  const [loading, request] = useRequest(options, initialLoadingState);

  const onSubmit = useCallback((fields: F): void => {
    const { current: initOptions } = opitonsRef;
    const { method = 'POST', normalize } = initOptions;
    const params = normalize ? normalize(fields) : fields;

    const options: RequestOptions<R> = {
      ...initOptions,
      method,
      onSuccess(response) {
        initOptions.onSuccess?.(response, fields);
      },
      onError(error) {
        const { onError } = initOptions;

        if (onError) {
          onError(error, fields);
        } else {
          message.error(error.message);
        }
      },
      onComplete() {
        initOptions.onComplete?.(fields);
      }
    };

    if (/^(?:GET|HEAD|TRACE|CONNECT)$/i.test(method)) {
      options.query = { ...options.query, ...params };
    } else {
      options.body = params;
    }

    request<R>(urlRef.current, options);
  }, []);

  return [loading, onSubmit];
}
