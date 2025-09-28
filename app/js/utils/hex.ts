/**
 * @module hex
 */

// 字母映射表
const alphabet: string = '0123456789ABCDEF';

/**
 * @type {string[]}
 * @description 字节到 Hex 字符串的查找表
 */
export const BYTE_TO_HEX_TABLE: string[] = [];

// 生成映射表
for (let i = 0; i < 16; i++) {
  const i16 = i * 16;

  for (let j = 0; j < 16; j++) {
    BYTE_TO_HEX_TABLE[i16 + j] = alphabet[i] + alphabet[j];
  }
}

/**
 * @function encode
 * @description 将字节数组编码 Hex 字符串
 * @param bytes 需要编码的字节数组
 */
export function encode(bytes: Uint8Array): string {
  let hex = '';

  for (const byte of bytes) {
    hex += BYTE_TO_HEX_TABLE[byte];
  }

  return hex;
}
