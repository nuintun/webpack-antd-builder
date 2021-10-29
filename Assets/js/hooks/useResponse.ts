/**
 * @module useResponse
 */

import { useCallback, useEffect, useState } from 'react';

import { message } from 'antd';
import usePersistRef from './usePersistRef';
import { RequestError } from '~js/utils/request';
import { Options as RequestOptions } from './useRequest';

type Fetch = (options?: RequestOptions) => Promise<void>;

type Request = <R>(url: string, options?: RequestOptions) => Promise<R>;

export interface Options extends RequestOptions {
  prefetch?: boolean;
  onError?: (error: RequestError) => void;
}

export interface TransformOptions<R, T> extends Options {
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
  options?: Options
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
  options: Options | TransformOptions<R, T> = {}
): [response: R | T | undefined, fetch: Fetch] {
  const [response, setResponse] = useState<R | T>();
  const initOptionsRef = usePersistRef(options as TransformOptions<R, T>);

  const fetch = useCallback<Fetch>(options => {
    return request<R>(url, { ...initOptionsRef.current, ...options })
      .then(response => {
        const { transform } = initOptionsRef.current;

        setResponse(transform ? transform(response) : response);
      })
      .catch(error => {
        const { onError } = initOptionsRef.current;

        if (onError) {
          onError(error);
        } else {
          message.error(error.message);
        }
      });
  }, []);

  useEffect(() => {
    initOptionsRef.current.prefetch && fetch();
  }, []);

  return [response, fetch];
}
