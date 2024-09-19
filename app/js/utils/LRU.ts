/**
 * @module LRU
 */

export default class LRU<K, V> {
  #max: number;
  #cache: Map<K, V>;

  public constructor(max: number) {
    this.#max = max;
    this.#cache = new Map();
  }

  public get size(): number {
    return this.#cache.size;
  }

  public set(key: K, value: V): void {
    const cache = this.#cache;

    if (this.has(key)) {
      this.delete(key);
    } else if (this.size === this.#max) {
      const keys = cache.keys();
      const head = keys.next();

      if (!head.done) {
        this.delete(head.value);
      }
    }

    cache.set(key, value);
  }

  public get(key: K): V | undefined {
    const cache = this.#cache;
    const item = cache.get(key);

    if (item) {
      this.delete(key);

      cache.set(key, item);

      return item;
    }
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
