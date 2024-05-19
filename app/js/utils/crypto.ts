/**
 * @module crypto
 */

const { fromCharCode } = String;

/**
 * @function safeAtob
 * @description 安全模式的 atob
 * @param text 要 Base64 解码的文本
 */

function safeAtob(text: string): string {
  try {
    return window.atob(text);
  } catch {
    return '';
  }
}

/**
 * @function toUint16
 * @param value 需要转换的数值
 */
function toUint16(value: number): number {
  return value & 0xffff;
}

/**
 * @function readUint16
 * @param text 原始文本
 * @param index 位置索引
 */
function readUint16(text: string, index: number): number {
  return text.charCodeAt(index) + (text.charCodeAt(++index) << 8);
}

/**
 * @function toByteString
 * @param value 需要转换的数值
 */
function toByteString(value: number): string {
  return fromCharCode(value & 0xff) + fromCharCode((value & 0xff00) >> 8);
}

/**
 * @function encrypt
 * @description 加密字符串
 * @param text 要加密的字符串
 */
export function encrypt(text: string): string {
  const { length } = text;
  const seed = new Uint16Array(1);
  const [key] = crypto.getRandomValues(seed);

  let output = '';
  let nextKey = key;
  let checkCode = 0;
  let encryptText = '';

  checkCode += nextKey;
  checkCode = toUint16(checkCode);

  for (let i = 0; i < length; i++) {
    const code = text.charCodeAt(i);
    const encryptCode = code ^ nextKey;

    checkCode += code;
    checkCode = toUint16(checkCode);

    nextKey ^= i ^ code;

    encryptText += toByteString(encryptCode);
  }

  checkCode = toUint16(~checkCode + 1);

  output += toByteString(key ^ encryptText.length);
  output += toByteString(checkCode);
  output += encryptText;

  return window.btoa(output);
}

/**
 * @function decrypt
 * @description 解密字符串
 * @param text 要解密的字符串
 */
export function decrypt(text: string): string {
  const atobText = safeAtob(text);
  const { length } = atobText;
  const offset = 4;

  if (length <= offset || length % 2 !== 0) {
    return '';
  }

  const encryptKey = readUint16(atobText, 0);

  let index = 0;
  let output = '';
  let checkCode = readUint16(atobText, 2);
  let nextKey = encryptKey ^ (length - offset);

  checkCode += nextKey;
  checkCode = toUint16(checkCode);

  for (let i = offset; i < length; i += 2) {
    const code = readUint16(atobText, i);
    const decryptCode = code ^ nextKey;

    checkCode += decryptCode;
    checkCode = toUint16(checkCode);

    nextKey ^= index++ ^ decryptCode;

    output += fromCharCode(decryptCode);
  }

  return checkCode !== 0 ? '' : output;
}
