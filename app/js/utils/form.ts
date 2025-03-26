/**
 * @module form
 */

export type Fields = Record<string | number, any>;

/**
 * @function serialize
 * @description 序列化参数
 * @param fields 需要序列化的参数
 * @param target 序列化的目标对象
 */
export function serialize<T extends FormData | URLSearchParams>(fields: Fields, target: T): T {
  const entries = Object.entries(fields);

  for (const [key, value] of entries) {
    if (value != null) {
      if (Array.isArray(value)) {
        for (const item of value) {
          if (item != null) {
            target.append(key, item);
          }
        }
      } else {
        target.append(key, value);
      }
    }
  }

  return target;
}
