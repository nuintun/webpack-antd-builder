const nativeStorage = self.localStorage;

/**
 * @namespace {object} storage
 */
const storage = {
  /**
   * @method has
   * @description 是否存在指定缓冲
   * @param {string} key
   * @returns {boolean}
   */
  has(key: string): boolean {
    return nativeStorage.hasOwnProperty(key);
  },
  /**
   * @method set
   * @description 设置缓存
   * @param {string} key
   * @param {any} value
   */
  set<V>(key: string, value: V): void {
    nativeStorage.setItem(key, JSON.stringify(value));
  },
  /**
   * @method get
   * @description 读取指定缓存
   * @param {string} key
   * @returns {any}
   */
  get<V>(key: string): V | null {
    const value = nativeStorage.getItem(key);

    try {
      return value ? JSON.parse(value) : value;
    } catch {
      // Do nothing
      return null;
    }
  },
  /**
   * @method remove
   * @description 删除指定缓存
   * @param {string} key
   */
  remove(key: string): void {
    nativeStorage.removeItem(key);
  }
};

export default storage;
