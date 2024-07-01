/**
 * @module useStorage
 */

import { isFunction } from '/js/utils/utils';
import { useCallback, useMemo } from 'react';
import createStorage from '/js/utils/storage';

export interface Options<V> {
  storage?: Storage;
  serializer?: (value: V) => string;
  deserializer?: (value: string) => V;
}

export interface DefaultValueOptions<V> extends Options<V> {
  defaultValue?: V | (() => V);
}

/**
 * @function useStorage
 * @description [hook] 本地缓存操作
 * @param key 缓存名称
 * @param options 缓存配置
 */
export default function useStorage<V>(
  key: string,
  options: DefaultValueOptions<V>
): [set: (value: V) => void, get: () => V, remove: () => void];
/**
 * @function useStorage
 * @description [hook] 使用本地缓存
 * @param key 缓存名称
 * @param options 缓存配置
 */
export default function useStorage<V = null>(
  key: string,
  options?: Options<V>
): [set: (value: V) => void, get: () => V | null, remove: () => void];
/**
 * @function useStorage
 * @description [hook] 使用本地缓存
 * @param key 缓存名称
 * @param options 缓存配置
 */
export default function useStorage<V = null>(
  key: string,
  options: Options<V> | DefaultValueOptions<V> = {}
): [set: (value: V) => void, get: () => V | null, remove: () => void] {
  const { defaultValue } = options as DefaultValueOptions<V>;

  const storage = useMemo(() => {
    const { storage = window.localStorage, serializer, deserializer } = options;

    return createStorage<V>(storage, serializer, deserializer);
  }, []);

  const set = useCallback((value: V) => {
    storage.set(key, value);
  }, []);

  const get = useCallback(() => {
    if (storage.has(key)) {
      return storage.get(key);
    }

    if (defaultValue == null) {
      return null;
    }

    return isFunction(defaultValue) ? defaultValue() : defaultValue;
  }, []);

  const remove = useCallback(() => {
    storage.remove(key);
  }, []);

  return [set, get, remove];
}
