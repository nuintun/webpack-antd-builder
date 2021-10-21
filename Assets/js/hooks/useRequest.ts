/**
 * @module useRequest
 */

import { History } from 'history';
import * as mime from '~js/utils/mime';
import useIsMounted from './useIsMounted';
import useLazyState from './useLazyState';
import { useHistory } from 'react-router-dom';
import usePersistCallback from './usePersistCallback';
import request, { Options as RequestOptions } from '~js/utils/request';
import { useRef } from 'react';

/**
 * @function onUnauthorizedHandler
 * @description 默认未授权操作
 * @param history 浏览器历史操作方法
 */
function onUnauthorizedHandler(history: History<any>): void {
  history.push('/login');
}

export interface Options<S> extends Omit<RequestOptions, 'onUnauthorized'> {
  onUnauthorized?: (history: History<S>) => void;
}

/**
 * @function useRequest
 * @description [hook] 请求操作
 * @param delay 加载状态延迟时间
 */
export default function useRequest<S>(
  delay?: number,
  onUnauthorized: (history: History<S>) => void = onUnauthorizedHandler
): [fetching: boolean, fetch: <R>(input: string, options?: Options<S>) => Promise<R>] {
  const retainRef = useRef(0);
  const history = useHistory<S>();
  const isMounted = useIsMounted();
  const [fetching, setFetching] = useLazyState(false, delay);

  const fetch = usePersistCallback(<R>(input: string, options: Options<S> = {}): Promise<R> => {
    return new Promise<R>(async (resolve, reject) => {
      setFetching(true);

      ++retainRef.current;

      const onUnauthorizedHandler = () => {
        if (options.onUnauthorized) {
          options.onUnauthorized(history);
        } else {
          onUnauthorized(history);
        }
      };

      const headers = { ...mime.json, ...options.headers };

      try {
        const payload = await request<R>(input, {
          ...options,
          headers,
          onUnauthorized: onUnauthorizedHandler
        });

        isMounted() && resolve(payload);
      } catch (error) {
        isMounted() && reject(error);
      }

      if (--retainRef.current <= 0) {
        setFetching(false, true);
      }
    });
  });

  return [fetching, fetch];
}
