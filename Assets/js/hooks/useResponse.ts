/**
 * @module useResponse
 */

import { useEffect, useState } from 'react';

import { message } from 'antd';
import usePersistCallback from './usePersistCallback';
import { Options as RequestOptions, RequestError } from '~js/utils/request';

type Fetch = (options?: RequestOptions) => Promise<void>;

type Request = <R>(url: string, options?: RequestOptions) => Promise<R>;

/**
 * @function onErrorHandler
 * @description 默认请求出错回调
 * @param error 请求错误对象
 */
function onErrorHandler(error: RequestError) {
  message.error(error.message);
}

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
  const defaults = options as TransformOptions<R, T>;
  const { prefetch, transform, onError = onErrorHandler } = defaults;

  const fetch = usePersistCallback<Fetch>(options => {
    return request<R>(url, { ...defaults, ...options })
      .then(response => {
        setResponse(transform ? transform(response) : response);
      })
      .catch(onError);
  });

  useEffect(() => {
    prefetch && fetch();
  }, []);

  return [response, fetch];
}
