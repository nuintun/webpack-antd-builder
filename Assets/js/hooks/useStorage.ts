/**
 * @module useStorage
 */

import { useCallback, useMemo } from 'react';

import { isFunction } from '~js/utils/utils';
import createStorage from '~js/utils/storage';

export interface Options<V> {
  session?: boolean;
  defaultValue?: V | (() => V);
  serializer?: (value: V) => string;
  deserializer?: (value: string) => V;
}

const { sessionStorage, localStorage } = globalThis;

/**
 * @function useStorage
 * @description 【Hook】本地缓存操作
 * @param key 缓存名称
 * @param options 缓存配置
 */
export default function useStorage<V>(
  key: string,
  options: RequiredBy<Options<V>, 'defaultValue'>
): [set: (value: V) => void, get: () => V, remove: () => void];
/**
 * @function useStorage
 * @description 【Hook】使用本地缓存
 * @param key 缓存名称
 * @param [options] 缓存配置
 */
export default function useStorage<V>(
  key: string,
  options?: Options<V>
): [set: (value: V) => void, get: () => V | null, remove: () => void];
export default function useStorage<V>(
  key: string,
  { session, serializer, deserializer, defaultValue }: Options<V> = {}
): [set: (value: V) => void, get: () => V | null, remove: () => void] {
  const storage = useMemo(() => {
    const storage = session ? sessionStorage : localStorage;

    return createStorage<V>(storage, serializer, deserializer);
  }, []);

  const set = useCallback((value: V) => {
    storage.set(key, value);
  }, []);

  const get = useCallback(() => {
    if (storage.has(key)) return storage.get(key);

    if (defaultValue == null) return null;

    return isFunction(defaultValue) ? defaultValue() : defaultValue;
  }, []);

  const remove = useCallback(() => {
    storage.remove(key);
  }, []);

  return [set, get, remove];
}
