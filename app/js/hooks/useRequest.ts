/**
 * @module useRequest
 */

import { App } from 'antd';
import * as mime from '/js/utils/mime';
import useIsMounted from './useIsMounted';
import useLatestRef from './useLatestRef';
import useLazyState from './useLazyState';
import { isObject } from '/js/utils/utils';
import { useCallback, useRef } from 'react';
import { Location, useLocation, useNavigate } from 'react-nest-router';
import fetch, { Options as RequestInit, RequestError } from '/js/utils/request';

const { useApp } = App;

export type Navigate = ReturnType<typeof useNavigate>;

export interface Request {
  <R>(url: string, options?: RequestOptions<R>): void;
}

export interface RequestOptions<R> extends Omit<Options, 'delay'> {
  onComplete?: () => void;
  onSuccess?: (response: R) => void;
  onError?: (error: RequestError) => void;
}

export interface Options extends Omit<RequestInit, 'onMessage' | 'onUnauthorized'> {
  delay?: number;
  notify?: boolean;
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
): [loading: boolean, request: Request] {
  const retainRef = useRef(0);
  const { message } = useApp();
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

      const { body, notify } = requestInit;
      const headers = new Headers(requestInit.headers);

      const onUnauthorized = () => {
        const { onUnauthorized } = requestInit;

        if (onUnauthorized) {
          onUnauthorized(navigate, location);
        } else {
          navigate('/login', { state: location });
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

      const onMessage = (content: string) => {
        notify && message.success(content);
      };

      fetch<R>(url, { ...requestInit, headers, onMessage, onUnauthorized })
        .then(
          response => {
            if (isMounted()) {
              requestInit.onSuccess?.(response);
            }
          },
          (error: RequestError) => {
            if (isMounted()) {
              const { onError } = requestInit;

              if (onError) {
                onError(error);
              } else if (error.code !== 401) {
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
