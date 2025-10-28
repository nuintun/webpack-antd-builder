/**
 * @module md5
 */

import { encode } from './hex';
import { isTypedArray, TypedArray } from './utils';

const utf8 = new TextEncoder();

const MD5_T = new Int32Array(64);

const G_INDEX = [
  (i: number): number => i,
  (i: number): number => (5 * i + 1) % 16,
  (i: number): number => (3 * i + 5) % 16,
  (i: number): number => (7 * i) % 16
];

// prettier-ignore
const MD5_SHIFT_AMOUNTS = new Uint8Array([
  0x07, 0x0c, 0x11, 0x16, 0x07, 0x0c, 0x11, 0x16,
  0x07, 0x0c, 0x11, 0x16, 0x07, 0x0c, 0x11, 0x16,
  0x05, 0x09, 0x0e, 0x14, 0x05, 0x09, 0x0e, 0x14,
  0x05, 0x09, 0x0e, 0x14, 0x05, 0x09, 0x0e, 0x14,
  0x04, 0x0b, 0x10, 0x17, 0x04, 0x0b, 0x10, 0x17,
  0x04, 0x0b, 0x10, 0x17, 0x04, 0x0b, 0x10, 0x17,
  0x06, 0x0a, 0x0f, 0x15, 0x06, 0x0a, 0x0f, 0x15,
  0x06, 0x0a, 0x0f, 0x15, 0x06, 0x0a, 0x0f, 0x15
]);

function leftRotate(x: number, c: number): number {
  return (x << c) | (x >>> (32 - c));
}

export type DigestEncoding = 'base64' | 'hex' | 'binary';

const F_TABLE = [
  (b: number, c: number, d: number): number => (b & c) | (~b & d),
  (b: number, c: number, d: number): number => (d & b) | (~d & c),
  (b: number, c: number, d: number): number => b ^ c ^ d,
  (b: number, c: number, d: number): number => c ^ (b | ~d)
];

for (let i = 0; i < 64; i++) {
  MD5_T[i] = Math.floor(Math.abs(Math.sin(i + 1)) * 0x100000000) | 0;
}

export class MD5 {
  #stateA = 0x67452301;
  #stateB = 0xefcdab89;
  #stateC = 0x98badcfe;
  #stateD = 0x10325476;

  #length = 0;
  #offset = 0;
  #buffer = new Uint8Array(64);

  #transformBlock(block: Uint8Array): void {
    const blockWords = new Uint32Array(16);
    const blockView = new DataView(block.buffer, block.byteOffset, block.byteLength);

    for (let i = 0; i < 16; i++) {
      blockWords[i] = blockView.getUint32(i * 4, true);
    }

    let a = this.#stateA;
    let b = this.#stateB;
    let c = this.#stateC;
    let d = this.#stateD;

    for (let i = 0; i < 64; i++) {
      const round = i >> 4;
      const wordIndex = G_INDEX[round](i);
      const fResult = F_TABLE[round](b, c, d);
      const sum = (a + fResult + MD5_T[i] + blockWords[wordIndex]) | 0;

      [a, b, c, d] = [d, (b + leftRotate(sum, MD5_SHIFT_AMOUNTS[i])) | 0, b, c];
    }

    this.#stateA = (this.#stateA + a) | 0;
    this.#stateB = (this.#stateB + b) | 0;
    this.#stateC = (this.#stateC + c) | 0;
    this.#stateD = (this.#stateD + d) | 0;
  }

  /**
   * @method update
   * @description 更新数据
   * @param input 要更新的数据
   */
  update(input: string | TypedArray): this {
    let offset = 0;

    if (isTypedArray(input)) {
      const { byteLength, byteOffset } = input;

      input = new Uint8Array(input.buffer, byteOffset, byteLength);
    } else {
      input = utf8.encode(input);
    }

    const { length } = input;

    this.#length += length;

    while (offset < length) {
      const remaining = 64 - this.#offset;
      const take = Math.min(remaining, length - offset);

      this.#buffer.set(input.subarray(offset, offset + take), this.#offset);

      this.#offset += take;

      offset += take;

      if (this.#offset === 64) {
        this.#transformBlock(this.#buffer);

        this.#offset = 0;
      }
    }

    return this;
  }

  /**
   * @method digest
   * @description 计算 MD5 值
   */
  digest(): Uint8Array<ArrayBuffer>;
  /**
   * @method digest
   * @description 计算 MD5 值
   * @param encoding 输出的编码方式
   */
  digest(encoding: DigestEncoding): string;
  /**
   * @method digest
   * @description 计算 MD5 值
   * @param encoding 输出的编码方式
   */
  digest(encoding?: DigestEncoding): string | Uint8Array<ArrayBuffer> {
    const padLength = (this.#offset < 56 ? 56 : 120) - this.#offset;
    const padding = new Uint8Array(padLength + 8);

    padding[0] = 0x80;

    const bitLength = this.#length * 8;
    const paddingView = new DataView(padding.buffer);

    paddingView.setUint32(padLength, bitLength, true);

    this.update(padding);

    const digest = new Uint8Array(16);
    const digestView = new DataView(digest.buffer);

    digestView.setUint32(0, this.#stateA, true);
    digestView.setUint32(4, this.#stateB, true);
    digestView.setUint32(8, this.#stateC, true);
    digestView.setUint32(12, this.#stateD, true);

    this.#length = 0;
    this.#offset = 0;

    this.#stateA = 0x67452301;
    this.#stateB = 0xefcdab89;
    this.#stateC = 0x98badcfe;
    this.#stateD = 0x10325476;

    switch (encoding) {
      case 'hex':
        return encode(digest);
      case 'binary':
        return String.fromCharCode(...digest);
      case 'base64':
        return btoa(String.fromCharCode(...digest));
      default:
        return digest;
    }
  }
}

const hasher = new MD5();

/**
 * @function md5
 * @description 计算 MD5 值
 * @param input 要计算的数据
 */
export function md5(input: string | TypedArray): string {
  return hasher.update(input).digest('hex');
}
