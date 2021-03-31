/**
 * @module useRequest
 */

import { useCallback } from 'react';

import * as mime from '~js/utils/mime';
import useIsMounted from './useIsMounted';
import useLazyState from './useLazyState';
import { useHistory } from 'react-router-dom';
import request, { Options } from '~js/utils/request';
import usePersistCallback from './usePersistCallback';

/**
 * @function useRequest
 * @description 【Hook】请求操作
 * @param delay 加载状态延迟时间
 */
export default function useRequest(delay?: number): [requesting: boolean, request: typeof request] {
  const history = useHistory();
  const isMounted = useIsMounted();
  const [requesting, setRequesting] = useLazyState(false, delay);

  const onUnauthorized = useCallback(() => {
    history.push('/login');
  }, [history]);

  const sendRequest = usePersistCallback(
    <R>(input: string, options: Options = {}): Promise<R> => {
      return new Promise<R>(async (resolve, reject) => {
        setRequesting(true);

        const headers = { ...mime.json, ...options.headers };

        try {
          const payload = await request<R>(input, { onUnauthorized, ...options, headers });

          isMounted() && resolve(payload);
        } catch (error) {
          isMounted() && reject(error);
        }

        setRequesting(false, true);
      });
    }
  );

  return [requesting, sendRequest];
}
