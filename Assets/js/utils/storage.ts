/**
 * @module storage
 */

export interface IStorage<V> {
  has(key: string): boolean;
  set(key: string, value: V): void;
  get(key: string): V | null;
  remove(key: string): void;
}

/**
 * @function createStorage
 * @param {Storage} storage
 * @param {Function} serializer
 * @param {Function} deserializer
 * @returns {IStorage}
 */
export default function createStorage<V>(
  storage: Storage,
  serializer: (value: V) => string = JSON.stringify,
  deserializer: (value: string) => V = JSON.parse
): IStorage<V> {
  return {
    /**
     * @method has
     * @description 是否存在指定缓冲
     * @param {string} key
     * @returns {boolean}
     */
    has(key: string): boolean {
      return storage.hasOwnProperty(key);
    },
    /**
     * @method set
     * @description 设置缓存
     * @param {string} key
     * @param {any} value
     */
    set(key: string, value: V): void {
      storage.setItem(key, serializer(value));
    },
    /**
     * @method get
     * @description 读取指定缓存
     * @param {string} key
     * @returns {any}
     */
    get(key: string): V | null {
      const value = storage.getItem(key);

      if (value !== null) {
        try {
          return deserializer(value);
        } catch {
          return null;
        }
      }

      return value;
    },
    /**
     * @method remove
     * @description 删除指定缓存
     * @param {string} key
     */
    remove(key: string): void {
      storage.removeItem(key);
    }
  };
}
