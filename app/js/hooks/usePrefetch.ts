/**
 * @module usePrefetch
 */

import useRequest, { Options as RequestOptions } from './useRequest';
import useResponse, { Dispatch, Options as InitOptions, Transform } from './useResponse';

export type Refetch = (options?: RequestOptions) => void;

export interface Options<R, T> extends Omit<InitOptions<R, T>, 'prefetch'> {
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
  options?: Options<R, R>,
  initialLoadingState?: boolean | (() => boolean)
): [loading: boolean, response: R | undefined, refetch: Refetch, dispatch: Dispatch<R | undefined>];
/**
 * @function usePrefetch
 * @description [hook] 预加载
 * @param url 请求地址
 * @param options 请求配置
 * @param initialLoadingState 初始加载状态
 */
export default function usePrefetch<R, T>(
  url: string,
  options: Options<R, T> & { transform: Transform<R, T> },
  initialLoadingState?: boolean | (() => boolean)
): [loading: boolean, response: T | undefined, refetch: Refetch, dispatch: Dispatch<T | undefined>];
/**
 * @function usePrefetch
 * @description [hook] 预加载
 * @param url 请求地址
 * @param options 请求配置
 * @param initialLoadingState 初始加载状态
 */
export default function usePrefetch<R, T>(
  url: string,
  options: Options<R, T> = {},
  initialLoadingState: boolean | (() => boolean) = false
): [loading: boolean, response: R | T | undefined, refetch: Refetch, dispatch: Dispatch<R | T | undefined>] {
  const [loading, request] = useRequest(options, initialLoadingState);
  const [response, refetch, dispatch] = useResponse(url, request, { ...options, prefetch: true } as Options<R, R>);

  return [loading, response, refetch, dispatch as Dispatch<R | T | undefined>];
}
