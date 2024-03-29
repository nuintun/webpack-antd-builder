/**
 * @module usePrefetch
 */

import useRequest, { Options as RequestOptions } from './useRequest';
import useResponse, { Options as InitOptions, TransformOptions as InitTransformOptions } from './useResponse';

type Refetch = (options?: RequestOptions) => void;

export interface Options<R> extends Omit<InitOptions<R>, 'prefetch'> {
  delay?: number;
}

export interface TransformOptions<R, T> extends Omit<InitTransformOptions<R, T>, 'prefetch'> {
  delay?: number;
}

/**
 * @function usePrefetch
 * @description [hook] 预加载
 * @param url 请求地址
 * @param options 请求配置
 * @param initialLoadingState 初始加载状态
 */
export default function usePrefetch<R>(
  url: string,
  options?: Options<R>,
  initialLoadingState?: boolean | (() => boolean)
): [loading: boolean, response: R | undefined, refetch: Refetch];
/**
 * @function usePrefetch
 * @description [hook] 预加载
 * @param url 请求地址
 * @param options 请求配置
 * @param initialLoadingState 初始加载状态
 */
export default function usePrefetch<R, T>(
  url: string,
  options: TransformOptions<R, T>,
  initialLoadingState?: boolean | (() => boolean)
): [loading: boolean, response: T | undefined, refetch: Refetch];
export default function usePrefetch<R, T>(
  url: string,
  options: Options<R> | TransformOptions<R, T> = {},
  initialLoadingState: boolean | (() => boolean) = false
): [loading: boolean, response: R | T | undefined, refetch: Refetch] {
  const [loading, request] = useRequest(options, initialLoadingState);
  const [response, refetch] = useResponse<R, T>(url, request, {
    ...(options as TransformOptions<R, T>),
    prefetch: true
  });

  return [loading, response, refetch];
}
