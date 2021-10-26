/**
 * @module useRequest
 */

import { useRef } from 'react';

import { History } from 'history';
import * as mime from '~js/utils/mime';
import useIsMounted from './useIsMounted';
import useLazyState from './useLazyState';
import { useHistory } from 'react-router-dom';
import usePersistCallback from './usePersistCallback';
import fetch, { Options as RequestOptions } from '~js/utils/request';

/**
 * @function onUnauthorizedHandler
 * @description 默认未授权操作
 * @param history 浏览器历史操作方法
 */
function onUnauthorizedHandler(history: History<any>): void {
  history.push('/login');
}

export interface Options extends Omit<RequestOptions, 'onUnauthorized'> {
  delay?: number;
  onUnauthorized?: (history: History<any>) => void;
}

/**
 * @function useRequest
 * @description [hook] 请求操作
 * @param optinos 请求配置
 * @param initialLoadingState 初始加载状态
 */
export default function useRequest(
  optinos: Options = {},
  initialLoadingState: boolean | (() => boolean) = false
): [loading: boolean, request: <R>(input: string, options?: Options) => Promise<R>] {
  const defaults = optinos;

  const retainRef = useRef(0);
  const isMounted = useIsMounted();
  const history = useHistory<any>();
  const [loading, setLoading] = useLazyState(initialLoadingState, optinos.delay);

  const request = usePersistCallback(<R>(input: string, options: Options = {}): Promise<R> => {
    return new Promise<R>(async (resolve, reject) => {
      setLoading(true);

      ++retainRef.current;

      const onUnauthorized = () => {
        if (options.onUnauthorized) {
          options.onUnauthorized(history);
        } else if (defaults.onUnauthorized) {
          defaults.onUnauthorized(history);
        } else {
          onUnauthorizedHandler(history);
        }
      };

      const headers = { ...mime.json, ...options.headers };

      try {
        const response = await fetch<R>(input, { ...defaults, ...options, headers, onUnauthorized });

        isMounted() && resolve(response);
      } catch (error) {
        isMounted() && reject(error);
      }

      if (--retainRef.current <= 0) {
        setLoading(false, true);
      }
    });
  });

  return [loading, request];
}
