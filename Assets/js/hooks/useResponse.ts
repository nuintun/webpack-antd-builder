/**
 * @module useResponse
 */

import { useEffect, useState } from 'react';

import { RequestOptions } from './useRequest';
import useStableCallback from './useStableCallback';

interface Fetch<R> {
  (options?: RequestOptions<R>): void;
}

interface Request<R> {
  (url: string, options?: RequestOptions<R>): void;
}

export interface Options<R> extends RequestOptions<R> {
  prefetch?: boolean;
}

export interface TransformOptions<R, T> extends Options<R> {
  transform: (response: R) => T;
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
  request: Request<R>,
  options?: Options<R>
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
  request: Request<R>,
  options: TransformOptions<R, T>
): [response: T | undefined, fetch: Fetch<R>];
export default function useResponse<R, T>(
  url: string,
  request: Request<R>,
  options: Options<R> | TransformOptions<R, T> = {}
): [response: R | T | undefined, fetch: Fetch<R>] {
  const initOptions = options;

  const [response, setResponse] = useState<R | T>();

  const fetch = useStableCallback<Fetch<R>>(options => {
    const requestInit = {
      ...initOptions,
      ...options
    } as TransformOptions<R, T>;

    request(url, {
      ...requestInit,
      onSuccess(response) {
        const { transform } = requestInit;

        requestInit.onSuccess?.(response);

        setResponse(transform ? transform(response) : response);
      }
    });
  });

  useEffect(() => {
    options.prefetch && fetch();
  }, []);

  return [response, fetch];
}
