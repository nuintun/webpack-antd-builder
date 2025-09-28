/**
 * @module hex
 */

import { BYTE_TO_HEX_TABLE } from './hex';

/**
 * @type {string[]}
 * @description 字节到可见字符的查找表
 */
const BYTE_TO_CHAR_TABLE: string[] = [];

for (let byte = 0; byte <= 0xff; byte++) {
  if (byte > 31 && byte < 127) {
    BYTE_TO_CHAR_TABLE.push(String.fromCodePoint(byte));
  } else {
    BYTE_TO_CHAR_TABLE.push('.');
  }
}

/**
 * @function getHexDigitCount
 * @description 获取 Hex 字符串的长度
 * @param length 数据长度
 */
function getHexDigitCount(length: number): number {
  if (length === 0) {
    return 1;
  }

  return (35 - Math.clz32(length)) >> 2;
}

/**
 * @function pad
 * @description 数字左边补零操作
 * @param {number} value
 * @param {number} max
 * @returns {string}
 */
function pad(value: number, max: number): string {
  if (value > 0xff) {
    return value.toString(16).padStart(max, '0');
  }

  return BYTE_TO_HEX_TABLE[value].padStart(max, '0');
}

/**
 * @function hexdump
 * @function Hex 查看器
 * @param {Uint8Array} buffer
 * @returns {string}
 */
export function hexdump(buffer: Uint8Array): string {
  let index = 0;
  let rowBytes: number;
  let rowSpaces: number;
  let hex = `\u001b[36mOFFSET  `;

  const { length } = buffer;
  const rows = Math.ceil(length / 16);

  for (let i = 0; i < 16; i++) {
    hex += ` ${pad(i, 2)}`;
  }

  hex += `\u001b[0m`;

  if (rows > 0) {
    hex += `\n\n`;
  }

  const maxRowIndex = rows - 1;
  const offset = Math.max(6, getHexDigitCount(length));

  for (let i = 0; i < rows; i++) {
    const isLastRow = i >= maxRowIndex;

    hex += `\u001b[36m${pad(index, offset)}\u001b[0m  `;
    rowBytes = isLastRow ? length - index : 16;
    rowSpaces = 16 - rowBytes;

    for (let j = 0; j < rowBytes; j++) {
      hex += ` \u001b[33m${pad(buffer[index++], 2)}\u001b[0m`;
    }

    for (let j = 0; j <= rowSpaces; j++) {
      hex += `   `;
    }

    index -= rowBytes;

    for (let j = 0; j < rowBytes; j++) {
      hex += BYTE_TO_CHAR_TABLE[buffer[index++]];
    }

    if (!isLastRow) {
      hex += `\n`;
    }
  }

  return hex;
}
