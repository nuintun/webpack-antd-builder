/**
 * @module BitMask
 */

export class BitMask {
  #mask: number;

  constructor(mask: number = 0) {
    this.#mask = mask;
  }

  get mask(): number {
    return this.#mask;
  }

  add(flag: number): BitMask {
    this.#mask |= flag;

    return this;
  }

  remove(flag: number): BitMask {
    this.#mask &= ~flag;

    return this;
  }

  has(flag: number): boolean {
    return (this.#mask & flag) === flag;
  }

  toJSON(): number {
    return this.#mask;
  }

  valueOf(): number {
    return this.#mask;
  }

  [Symbol.toPrimitive]() {
    return this.#mask;
  }

  toString(): string {
    return this.#mask.toString();
  }
}
