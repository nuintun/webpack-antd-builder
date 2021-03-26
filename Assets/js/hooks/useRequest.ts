import { useCallback } from 'react';

import * as mime from '~js/utils/mime';
import useLazyState from './useLazyState';
import { useHistory } from 'react-router-dom';
import useMountedState from './useMountedState';
import request, { Options } from '~js/utils/request';
import usePersistCallback from './usePersistCallback';

export default function useRequest(delay?: number): [loading: boolean, request: typeof request] {
  const history = useHistory();
  const isMounted = useMountedState();
  const [loading, setLoading] = useLazyState(false, delay);

  const onUnauthorized = useCallback(() => {
    history.push('/login');
  }, [history]);

  const sendRequest = usePersistCallback(
    <R>(input: string, options: Options = {}): Promise<R> => {
      return new Promise<R>(async (resolve, reject) => {
        setLoading(true);

        try {
          const headers = { ...mime.json, ...options.headers };
          const payload = await request<R>(input, { onUnauthorized, ...options, headers });

          isMounted() && resolve(payload);
        } catch (error) {
          isMounted() && reject(error);
        }

        setLoading(false, true);
      });
    }
  );

  return [loading, sendRequest];
}
