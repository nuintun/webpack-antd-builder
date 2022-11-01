/**
 * @module useRequest
 */

import { useCallback, useRef } from 'react';

import { message } from 'antd';
import * as mime from '/js/utils/mime';
import useIsMounted from './useIsMounted';
import useLatestRef from './useLatestRef';
import useLazyState from './useLazyState';
import { isObject } from '/js/utils/utils';
import { Location, useLocation, useNavigate } from 'react-nest-router';
import fetch, { Options as RequestInit, RequestError } from '/js/utils/request';

export type Navigate = ReturnType<typeof useNavigate>;

export interface Options extends Omit<RequestInit, 'onUnauthorized'> {
  delay?: number;
  onUnauthorized?: (navigate: Navigate, location: Location) => void;
}

export interface RequestOptions<R> extends Omit<Options, 'delay'> {
  onComplete?: () => void;
  onSuccess?: (response: R) => void;
  onError?: (error: RequestError<R>) => void;
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

/**
 * @function useRequest
 * @description [hook] 请求操作
 * @param options 请求配置
 * @param initialLoadingState 初始加载状态
 */
export default function useRequest(
  options: Options = {},
  initialLoadingState: boolean | (() => boolean) = false
): [loading: boolean, request: <R>(url: string, options?: RequestOptions<R>) => void] {
  const retainRef = useRef(0);
  const location = useLocation();
  const navigate = useNavigate();
  const isMounted = useIsMounted();
  const opitonsRef = useLatestRef(options);
  const [loading, setLoading] = useLazyState(initialLoadingState, options.delay);

  const request = useCallback(<R>(url: string, options: RequestOptions<R> = {}): void => {
    if (isMounted()) {
      const requestInit = {
        ...opitonsRef.current,
        ...options
      };

      const { body } = requestInit;
      const headers = new Headers(requestInit.headers);

      const onUnauthorized = () => {
        const { onUnauthorized } = requestInit;

        if (onUnauthorized) {
          onUnauthorized(navigate, location);
        } else {
          onUnauthorizedHandler(navigate, location);
        }
      };

      if (retainRef.current++ <= 0) {
        setLoading(true);
      }

      if (isObject(body) || Array.isArray(body)) {
        if (!headers.has('Content-Type')) {
          headers.set('Content-Type', mime.json);
        }
      }

      fetch<R>(url, { ...requestInit, headers, onUnauthorized })
        .then(
          response => {
            if (isMounted()) {
              requestInit.onSuccess?.(response);
            }
          },
          (error: RequestError<R>) => {
            if (isMounted()) {
              const { onError } = requestInit;

              if (onError) {
                onError(error);
              } else {
                message.error(error.message);
              }
            }
          }
        )
        .finally(() => {
          if (isMounted()) {
            if (--retainRef.current <= 0) {
              setLoading(false, 0);
            }

            requestInit.onComplete?.();
          }
        });
    }
  }, []);

  return [loading, request];
}
