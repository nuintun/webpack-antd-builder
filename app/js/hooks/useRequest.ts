/**
 * @module useRequest
 */

import { App } from 'antd';
import { useRef } from 'react';
import useIsMounted from './useIsMounted';
import useLazyState from './useLazyState';
import { isObject } from '/js/utils/utils';
import useLatestCallback from './useLatestCallback';
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
  const [loading, setLoading] = useLazyState(initialLoadingState, options.delay);

  const request = useLatestCallback(<R>(url: string, requestInit: RequestOptions<R> = {}): void => {
    if (isMounted()) {
      requestInit = {
        ...options,
        ...requestInit
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

      if (!headers.has('Accept')) {
        headers.set('Accept', 'application/vnd.msgpack');
      }

      if (isObject(body) || Array.isArray(body)) {
        if (!headers.has('Content-Type')) {
          headers.set('Content-Type', 'application/vnd.msgpack');
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
  });

  return [loading, request];
}
