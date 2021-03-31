/**
 * @module usePrefetch
 */

import { useEffect, useState } from 'react';

import { message } from 'antd';
import useRequest from './useRequest';
import usePersistCallback from './usePersistCallback';
import { Options as RequestOptions, RequestError } from '~js/utils/request';

export interface Options extends RequestOptions {
  delay?: number;
  onError?: (error: RequestError) => void;
}

/**
 * @function usePrefetch
 * @description 【Hook】预加载
 * @param url 请求地址
 * @param options 请求配置
 */
export default function usePrefetch<R>(
  url: string,
  options: Options = {}
): [fetching: boolean, response: R | undefined, refresh: () => Promise<void>] {
  const { delay, onError, ...requestOptions } = options;

  const [fetching, request] = useRequest(delay);
  const [response, setResponse] = useState<R>();

  const refresh = usePersistCallback(async () => {
    try {
      setResponse(await request<R>(url, requestOptions));
    } catch (error) {
      if (onError) {
        onError && onError(error);
      } else {
        message.error(error.message);
      }
    }
  });

  useEffect(() => {
    refresh();
  }, []);

  return [fetching, response, refresh];
}
