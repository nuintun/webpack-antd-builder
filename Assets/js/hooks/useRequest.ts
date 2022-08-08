/**
 * @module useRequest
 */

import { useCallback, useRef } from 'react';

import * as mime from '/js/utils/mime';
import useIsMounted from './useIsMounted';
import useLazyState from './useLazyState';
import { isObject } from '/js/utils/utils';
import usePersistRef from './usePersistRef';
import fetch, { Options as RequestOptions } from '/js/utils/request';
import { Location, NavigateOptions, To, useLocation, useNavigate } from 'react-nest-router';

export interface Navigate {
  (delta: number): void;
  <S = unknown>(to: To, options?: NavigateOptions<S>): void;
}

/**
 * @function onUnauthorizedHandler
 * @description 默认未授权操作
 * @param navigate 导航方法
 * @param location 导航信息
 */
function onUnauthorizedHandler(navigate: Navigate, location: Location): void {
  navigate('/login', { state: location });
}

export interface Options extends Omit<RequestOptions, 'onUnauthorized'> {
  delay?: number;
  onUnauthorized?: (navigate: Navigate, location: Location) => void;
}

/**
 * @function useRequest
 * @description [hook] 请求操作
 * @param options 请求配置
 * @param initialLoadingState 初始加载状态
 */
export default function useRequest(
  options: Options = {},
  initialLoadingState: boolean | (() => boolean) = false
): [loading: boolean, request: <R>(url: string, options?: Options) => Promise<R>] {
  const retainRef = useRef(0);
  const location = useLocation();
  const navigate = useNavigate();
  const isMounted = useIsMounted();
  const initOptionsRef = usePersistRef(options);
  const [loading, setLoading] = useLazyState(initialLoadingState, options.delay);

  const request = useCallback(<R>(url: string, options: Options = {}): Promise<R> => {
    return new Promise<R>((resolve, reject) => {
      if (isMounted()) {
        if (retainRef.current++ <= 0) {
          setLoading(true);
        }

        const { body } = options;
        const headers = new Headers(options.headers);

        if (isObject(body) || Array.isArray(body)) {
          if (!headers.has('Content-Type')) {
            headers.set('Content-Type', mime.json);
          }
        }

        const onUnauthorized = () => {
          const { onUnauthorized } = options;
          const { onUnauthorized: onInitUnauthorized } = initOptionsRef.current;

          if (onUnauthorized) {
            onUnauthorized(navigate, location);
          } else if (onInitUnauthorized) {
            onInitUnauthorized(navigate, location);
          } else {
            onUnauthorizedHandler(navigate, location);
          }
        };

        return fetch<R>(url, { ...initOptionsRef.current, ...options, headers, onUnauthorized })
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
