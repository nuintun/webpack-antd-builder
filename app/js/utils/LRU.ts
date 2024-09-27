/**
 * @module LRU
 */

export default class LRU<K, V> {
  #cache: Map<K, V>;
  #capacity: number;

  public constructor(capacity: number) {
    this.#cache = new Map();
    this.#capacity = capacity;
  }

  public get size(): number {
    return this.#cache.size;
  }

  public set(key: K, value: V): void {
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

  public get(key: K): V | undefined {
    const cache = this.#cache;
    const value = cache.get(key);

    if (cache.has(key)) {
      cache.delete(key);
      cache.set(key, value as V);
    }

    return value;
  }

  public has(key: K): boolean {
    return this.#cache.has(key);
  }

  public delete(key: K): void {
    this.#cache.delete(key);
  }

  public clear(): void {
    this.#cache.clear();
  }

  public keys(): IterableIterator<K> {
    return this.#cache.keys();
  }

  public values(): IterableIterator<V> {
    return this.#cache.values();
  }

  public entries(): IterableIterator<[K, V]> {
    return this.#cache.entries();
  }

  public toJSON(): { key: K; value: V }[] {
    const json: { key: K; value: V }[] = [];

    for (const [key, value] of this) {
      json.push({ key, value });
    }

    return json;
  }

  public toString(): string {
    const strings: string[] = [];

    for (const [key, value] of this) {
      strings.push(`${key}:${value}`);
    }

    return strings.join(' < ');
  }

  public [Symbol.iterator](): IterableIterator<[K, V]> {
    return this.entries();
  }
}
