/**
 * @module crypto
 */

/**
 * @function safeAtob
 * @description 安全模式的 atob
 * @param text 要 Base64 解码的文本
 */
function safeAtob(text: string): string {
  try {
    return globalThis.atob(text);
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
 * @function encodeUint16
 * @param value 需要编码的16位数值
 */
function encodeUint16(value: number): string {
  return String.fromCharCode(value & 0xff, (value & 0xff00) >> 8);
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
 * @function encrypt
 * @description 加密字符串
 * @param plainText 要加密的字符串
 */
export function encrypt(plainText: string): string {
  const { length } = plainText;
  const seed = new Uint16Array(1);
  const [key] = crypto.getRandomValues(seed);

  let checksum = 0;
  let currentKey = key;

  checksum += currentKey;
  checksum = toUint16(checksum);

  const encryptedChunks: string[] = [];

  for (let i = 0; i < length; i++) {
    const code = plainText.charCodeAt(i);
    const encryptedCode = code ^ currentKey;

    checksum += code;
    checksum = toUint16(checksum);

    currentKey ^= i ^ code;

    encryptedChunks[i] = encodeUint16(encryptedCode);
  }

  checksum = toUint16(~checksum + 1);

  return globalThis.btoa(
    // 解密密钥
    encodeUint16(key ^ (length * 2)) +
      // 校验值
      encodeUint16(checksum) +
      // 加密数据
      encryptedChunks.join('')
  );
}

/**
 * @function decrypt
 * @description 解密字符串
 * @param cipherText 要解密的字符串
 */
export function decrypt(cipherText: string): string {
  const atobText = safeAtob(cipherText);
  const { length } = atobText;
  const offset = 4;

  if (length <= offset || (length & 1) !== 0) {
    return '';
  }

  const key = readUint16(atobText, 0);

  let checksum = readUint16(atobText, 2);
  let currentKey = key ^ (length - offset);

  checksum += currentKey;
  checksum = toUint16(checksum);

  const decryptedChunks: string[] = [];

  for (let index = 0, i = offset; i < length; i += 2) {
    const code = readUint16(atobText, i);
    const decryptedCode = code ^ currentKey;

    checksum += decryptedCode;
    checksum = toUint16(checksum);

    currentKey ^= index ^ decryptedCode;

    decryptedChunks[index++] = String.fromCharCode(decryptedCode);
  }

  return checksum !== 0 ? '' : decryptedChunks.join('');
}
