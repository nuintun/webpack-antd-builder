/**
 * @module useRequest
 */

import { useCallback, useRef } from 'react';

import { History } from 'history';
import * as mime from '/js/utils/mime';
import useIsMounted from './useIsMounted';
import useLazyState from './useLazyState';
import usePersistRef from './usePersistRef';
import { useHistory } from 'react-router-dom';
import fetch, { Options as RequestOptions } from '/js/utils/request';

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
): [loading: boolean, request: <R>(url: string, options?: Options) => Promise<R>] {
  const retainRef = useRef(0);
  const isMounted = useIsMounted();
  const history = useHistory<any>();
  const initOptionsRef = usePersistRef(optinos);
  const [loading, setLoading] = useLazyState(initialLoadingState, optinos.delay);

  const request = useCallback(<R>(url: string, options: Options = {}): Promise<R> => {
    return new Promise<R>((resolve, reject) => {
      if (isMounted()) {
        if (retainRef.current++ <= 0) {
          setLoading(true);
        }

        const initOptions = initOptionsRef.current;

        const onUnauthorized = () => {
          if (options.onUnauthorized) {
            options.onUnauthorized(history);
          } else if (initOptions.onUnauthorized) {
            initOptions.onUnauthorized(history);
          } else {
            onUnauthorizedHandler(history);
          }
        };

        const headers = { ...mime.json, ...options.headers };

        return fetch<R>(url, { ...initOptions, ...options, headers, onUnauthorized })
          .then(
            response => {
              isMounted() && resolve(response);
            },
            error => {
              isMounted() && reject(error);
            }
          )
          .finally(() => {
            if (--retainRef.current <= 0) {
              isMounted() && setLoading(false, true);
            }
          });
      }
    });
  }, []);

  return [loading, request];
}
