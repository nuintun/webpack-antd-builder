/**
 * @module BitMask
 */

export class BitMask {
  #mask: number;

  constructor(mask: number = 0) {
    this.#mask = mask;
  }

  public get mask(): number {
    return this.#mask;
  }

  public add(flag: number): BitMask {
    this.#mask |= flag;

    return this;
  }

  public remove(flag: number): BitMask {
    this.#mask &= ~flag;

    return this;
  }

  public has(flag: number): boolean {
    return (this.#mask & flag) === flag;
  }

  public toJSON(): number {
    return this.#mask;
  }

  public valueOf(): number {
    return this.#mask;
  }

  public toString(): string {
    return this.#mask.toString();
  }
}
