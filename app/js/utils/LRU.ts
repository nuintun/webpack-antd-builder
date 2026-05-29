/**
 * @module LRU
 */

export default class LRU<K, V> {
  #cache: Map<K, V>;
  #capacity: number;

  constructor(capacity: number) {
    this.#cache = new Map();
    this.#capacity = capacity;
  }

  get size(): number {
    return this.#cache.size;
  }

  set(key: K, value: V): void {
    const cache = this.#cache;

    if (cache.has(key)) {
      cache.delete(key);
    } else if (cache.size === this.#capacity) {
      const keys = cache.keys();
      const head = keys.next();

      if (!head.done) {
        cache.delete(head.value);
      }
    }

    cache.set(key, value);
  }

  get(key: K): V | undefined {
    const cache = this.#cache;
    const value = cache.get(key);

    if (cache.has(key)) {
      cache.delete(key);
      cache.set(key, value as V);
    }

    return value;
  }

  has(key: K): boolean {
    return this.#cache.has(key);
  }

  delete(key: K): void {
    this.#cache.delete(key);
  }

  clear(): void {
    this.#cache.clear();
  }

  keys(): IterableIterator<K> {
    return this.#cache.keys();
  }

  values(): IterableIterator<V> {
    return this.#cache.values();
  }

  entries(): IterableIterator<[K, V]> {
    return this.#cache.entries();
  }

  toJSON(): { key: K; value: V }[] {
    const json: { key: K; value: V }[] = [];

    for (const [key, value] of this) {
      json.push({ key, value });
    }

    return json;
  }

  toString(): string {
    const strings: string[] = [];

    for (const [key, value] of this) {
      strings.push(`${key}:${value}`);
    }

    return strings.join(' < ');
  }

  [Symbol.iterator](): IterableIterator<[K, V]> {
    return this.entries();
  }
}
