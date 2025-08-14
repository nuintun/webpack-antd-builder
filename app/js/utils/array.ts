/**
 * @module array
 */

type NonRecursive = Date | RegExp | Function | readonly unknown[];

type Primitive = string | number | boolean | bigint | symbol | null | undefined;

/**
 * @description 获取对象所有可能的键路径（key paths），支持可选属性
 * @example
 * interface User {
 *   id: bigint;
 *   name: string;
 *   config?(): void;
 *   address?: {
 *     city: string[];
 *     street?: string;
 *   };
 * }
 *
 * type Paths = KeyPath<User>;
 * // => "id" | "name" | "config" | "address" | "address.city" | "address.street"
 */
export type KeyPath<T> = T extends NonRecursive | Primitive
  ? never
  : {
      [K in keyof T]-?: K extends string | number
        ? NonNullable<T[K]> extends NonRecursive | Primitive | never
          ? `${K}`
          : `${K}` | `${K}.${KeyPath<NonNullable<T[K]>>}`
        : never;
    }[keyof T];

export function groupBy<I, K extends string | number | symbol>(
  items: ArrayLike<I>,
  group: (item: I, index: number) => K
): Partial<Record<K, I[]>>;
export function groupBy<I, K extends string | number | symbol, T>(
  items: ArrayLike<I>,
  group: (item: I, index: number) => K,
  transform: (item: I, index: number) => T
): Partial<Record<K, T[]>>;
export function groupBy<I, K extends string | number | symbol, T>(
  items: ArrayLike<I>,
  group: (item: I, index: number) => K,
  transform?: (item: I, index: number) => T
): Partial<Record<K, (I | T)[]>> {
  const { length } = items;
  const output: Record<K, (I | T)[]> = Object.create(null);

  for (let index = 0; index < length; index++) {
    const item = items[index];
    const key = group(item, index);
    const value = transform ? transform(item, index) : item;

    if (output[key]) {
      output[key].push(value);
    } else {
      output[key] = [value];
    }
  }

  return output;
}

export function searchBy<I>(
  items: ArrayLike<I>,
  fields: KeyPath<I>[],
  keyword: string,
  filter: (item: I, field: KeyPath<I>, keyword: string, index: number) => boolean
): I[] {
  const { length } = items;
  const matches = new Map<KeyPath<I>, I[]>();

  for (let index = 0; index < length; index++) {
    const item = items[index];

    for (const field of fields) {
      if (filter(item, field, keyword, index)) {
        const items = matches.get(field) ?? [];

        items.push(item);

        matches.set(field, items);
        break;
      }
    }
  }

  return fields.flatMap(field => matches.get(field) ?? []);
}
