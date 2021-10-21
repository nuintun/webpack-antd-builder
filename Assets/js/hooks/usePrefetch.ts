/**
 * @module usePrefetch
 */

import { useEffect } from 'react';

import useRequest from './useRequest';
import { Options as RequestOptions } from '~js/utils/request';
import useResponse, { Options as ResponseOptions, TransformOptions as TransformResponseOptions } from './useResponse';

type Refetch = (options?: RequestOptions) => Promise<void>;

export interface Options extends RequestOptions, ResponseOptions {
  delay?: number;
}

export interface TransformOptions<R, T> extends TransformResponseOptions<R, T> {
  delay?: number;
}

/**
 * @function usePrefetch
 * @description [hook] 预加载
 * @param url 请求地址
 * @param options 请求配置
 */
export default function usePrefetch<R>(
  url: string,
  options?: Options
): [fetching: boolean, response: R | undefined, refetch: Refetch];
/**
 * @function usePrefetch
 * @description [hook] 预加载
 * @param url 请求地址
 * @param options 请求配置
 */
export default function usePrefetch<R, T>(
  url: string,
  options: TransformOptions<R, T>
): [fetching: boolean, response: T | undefined, refetch: Refetch];
export default function usePrefetch<R, T>(
  url: string,
  options: Options | TransformOptions<R, T> = {}
): [fetching: boolean, response: R | T | undefined, refetch: Refetch] {
  const [fetching, request] = useRequest(options.delay, options);
  const [response, refetch] = useResponse<R, T>(url, request, options as TransformOptions<R, T>);

  useEffect(() => {
    refetch();
  }, []);

  return [fetching, response, refetch];
}
