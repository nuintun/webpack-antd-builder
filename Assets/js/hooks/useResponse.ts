/**
 * @module useResponse
 */

import { useCallback, useEffect, useState } from 'react';

import { message } from 'antd';
import usePersistRef from './usePersistRef';
import { RequestError } from '~js/utils/request';
import { Options as RequestOptions } from './useRequest';

type Request = <R>(url: string, options?: RequestOptions) => Promise<R>;

type Fetch = (options?: Omit<RequestOptions, 'onUnauthorized'>) => Promise<void>;

export interface Options<R> extends RequestOptions {
  prefetch?: boolean;
  onSuccess?: (response: R) => void;
  onError?: (error: RequestError) => void;
  onComplete?: () => void;
}

export interface TransformOptions<R, T> extends Options<R> {
  transform: (response: R) => T;
}

/**
 * @function useResponse
 * @description [hook]
 * @param url 请求地址
 * @param fetch 发送请求工厂函数
 */
export default function useResponse<R>(
  url: string,
  request: Request,
  options?: Options<R>
): [response: R | undefined, fetch: Fetch];
/**
 * @function useResponse
 * @description [hook]
 * @param url 请求地址
 * @param fetch 发送请求工厂函数
 * @param options 请求结果转换函数
 */
export default function useResponse<R, T>(
  url: string,
  request: Request,
  options: TransformOptions<R, T>
): [response: T | undefined, fetch: Fetch];
export default function useResponse<R, T>(
  url: string,
  request: Request,
  options: Options<R> | TransformOptions<R, T> = {}
): [response: R | T | undefined, fetch: Fetch] {
  const [response, setResponse] = useState<R | T>();
  const initOptionsRef = usePersistRef(options as TransformOptions<R, T>);

  const fetch = useCallback<Fetch>(options => {
    const initOptions = initOptionsRef.current;

    return request<R>(url, { ...initOptions, ...options })
      .then(
        response => {
          const { transform, onSuccess } = initOptionsRef.current;

          onSuccess && onSuccess(response);

          setResponse(transform ? transform(response) : response);
        },
        error => {
          const { onError } = initOptionsRef.current;

          if (onError) {
            onError(error);
          } else {
            message.error(error.message);
          }
        }
      )
      .finally(initOptions.onComplete);
  }, []);

  useEffect(() => {
    initOptionsRef.current.prefetch && fetch();
  }, []);

  return [response, fetch];
}
