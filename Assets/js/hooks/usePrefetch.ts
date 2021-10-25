/**
 * @module usePrefetch
 */

import useRequest, { Options as RequestOptions } from './useRequest';
import useResponse, { Options as ResponseOptions, TransformOptions as TransformResponseOptions } from './useResponse';

type Refetch = (options?: RequestOptions) => Promise<void>;

export interface Options extends Omit<ResponseOptions, 'prefetch'> {}

export interface TransformOptions<R, T> extends Omit<TransformResponseOptions<R, T>, 'prefetch'> {}

/**
 * @function usePrefetch
 * @description [hook] 预加载
 * @param url 请求地址
 * @param options 请求配置
 */
export default function usePrefetch<R>(
  url: string,
  options?: Options
): [loading: boolean, response: R | undefined, refetch: Refetch];
/**
 * @function usePrefetch
 * @description [hook] 预加载
 * @param url 请求地址
 * @param options 请求配置
 */
export default function usePrefetch<R, T>(
  url: string,
  options: TransformOptions<R, T>
): [loading: boolean, response: T | undefined, refetch: Refetch];
export default function usePrefetch<R, T>(
  url: string,
  options: Options | TransformOptions<R, T> = {}
): [loading: boolean, response: R | T | undefined, refetch: Refetch] {
  const [loading, request] = useRequest(true, options);
  const [response, refetch] = useResponse<R, T>(url, request, {
    ...(options as TransformOptions<R, T>),
    prefetch: true
  });

  return [loading, response, refetch];
}
