/**
 * @module useResponse
 */

import useLatestRef from './useLatestRef';
import { Request, RequestOptions } from './useRequest';
import { useCallback, useEffect, useState } from 'react';

export interface Transform<R, T> {
  (response: R): T;
}

export interface Fetch<R> {
  (options?: RequestOptions<R>): void;
}

export interface Options<R, T> extends RequestOptions<R> {
  prefetch?: boolean;
  transform?: Transform<R, T>;
}

/**
 * @function useResponse
 * @description [hook]
 * @param url 请求地址
 * @param request 发送请求工厂函数
 * @param options 发送请求请求配置
 */
export default function useResponse<R>(
  url: string,
  request: Request,
  options?: Options<R, R>
): [response: R | undefined, fetch: Fetch<R>];
/**
 * @function useResponse
 * @description [hook]
 * @param url 请求地址
 * @param request 发送请求工厂函数
 * @param options 发送请求请求配置
 */
export default function useResponse<R, T>(
  url: string,
  request: Request,
  options?: Options<R, T>
): [response: T | undefined, fetch: Fetch<R>];
export default function useResponse<R, T>(
  url: string,
  request: Request,
  options: Options<R, T> = {}
): [response: R | T | undefined, fetch: Fetch<R>] {
  const urlRef = useLatestRef(url);
  const opitonsRef = useLatestRef(options);
  const [response, setResponse] = useState<R | T>();

  const fetch = useCallback<Fetch<R>>(options => {
    const requestInit: Options<R, T> = {
      ...opitonsRef.current,
      ...options
    };

    request(urlRef.current, {
      ...requestInit,
      onSuccess(response) {
        const { transform } = requestInit;

        requestInit.onSuccess?.(response);

        setResponse(transform ? transform(response) : response);
      }
    });
  }, []);

  useEffect(() => {
    if (options.prefetch) {
      fetch();
    }
  }, []);

  return [response, fetch];
}
