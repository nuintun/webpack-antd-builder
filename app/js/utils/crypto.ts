/**
 * @module crypto
 */

// 数据包信息
const enum Packet {
  HEAD_SIZE = 0x08,
  KEY_OFFSET = 0x04,
  CHECKSUM_OFFSET = 0x00,
  XOR_KEY_SEED = 0x76efd8ba,
  SECURITY_KEY_SEED = 0xf0578e23
}

// 预创建补位缓冲区，减少垃圾回收次数
const padding = new Uint8Array(4);
// 预创建补位缓冲区视图，减少垃圾回收次数
const paddingView = new DataView(padding.buffer);

/**
 * @function seedToRandom
 * @description 基于 LCG 算法通过种子生成随机数
 * @param seed 随机数种子
 * @returns {number}
 */
function seedToRandom(seed: number): number {
  return (seed * 0x343fd + 0x269ec3) & 0xffff;
}

/**
 * @function deriveXorKey
 * @description 派生 XOR 密钥
 * @param {number} seed XOR 密钥种子
 * @returns {number}
 */
function deriveXorKey(seed: number): number {
  const high = seedToRandom(seed >>> 16);
  const low = seedToRandom(seed & 0xffff);

  return (((high << 16) | low) ^ Packet.XOR_KEY_SEED) >>> 0;
}

// 安全密钥
const SECURITY_KEY = deriveXorKey(Packet.SECURITY_KEY_SEED);

// CRC32C 查找表，用于快速计算 CRC32C 校验值
const CRC32C_TABLE = new Uint32Array(256);

for (let i = 0; i < 256; i++) {
  let crc = i;

  for (let j = 0; j < 8; j++) {
    crc = (crc >>> 1) ^ (-(crc & 1) & 0x82f63b78);
  }

  CRC32C_TABLE[i] = crc >>> 0;
}

/**
 * @function crc32c
 * @description 计算数据的 CRC32C 校验值
 * @param {Uint8Array} bytes 输入数据
 * @param {number} offset 起始偏移量
 * @param {number} end 结束偏移量
 * @returns {number} CRC32C 校验值
 */
function crc32c(bytes: Uint8Array, offset: number, end: number): number {
  let crc = 0xffffffff;

  for (let i = offset; i < end; i++) {
    crc = CRC32C_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  }

  return (crc ^ 0xffffffff) >>> 0;
}

/**
 * @function encryptBlock
 * @description 加密单个数据块并派生下一个密钥
 * @param {DataView} view 数据视图
 * @param {number} offset 数据块偏移量（以 4 字节为单位）
 * @param {number} xorKey XOR 加密密钥
 * @param {boolean} [littleEndian] 是否使用小端字节序
 * @returns {number} 根据加密数据派生的新密钥
 */
function encryptBlock(view: DataView, offset: number, xorKey: number, littleEndian?: boolean): number {
  // 计算当前块偏移位置
  const blockOffset = Packet.HEAD_SIZE + offset * 4;
  // 读取4字节数据并与密钥进行 XOR 运算实现加密
  const value = (view.getUint32(blockOffset, littleEndian) ^ xorKey) >>> 0;

  // 写入加密后的数据
  view.setUint32(blockOffset, value, littleEndian);

  // 根据加密后的数据派生新的密钥，实现密钥流加密
  return deriveXorKey(value);
}

/**
 * @function decryptBlock
 * @description 解密单个数据块并派生下一个密钥
 * @param {DataView} view 数据视图
 * @param {number} offset 数据块偏移量（以 4 字节为单位）
 * @param {number} xorKey XOR 解密密钥
 * @param {boolean} [littleEndian] 是否使用小端字节序
 * @returns {number} 根据解密数据派生的新密钥
 */
function decryptBlock(view: DataView, offset: number, xorKey: number, littleEndian?: boolean): number {
  // 计算当前块偏移位置
  const blockOffset = offset * 4;
  // 读取当前块数据
  const value = view.getUint32(blockOffset, littleEndian);

  // 进行 XOR 解密并写入解密后的数据
  view.setUint32(blockOffset, value ^ xorKey, littleEndian);

  // 更新解密密钥，实现密钥流解密
  return deriveXorKey(value);
}

/**
 * @function encrypt
 * @description 对数据进行加密处理
 * @param {Uint8Array} buffer 需要加密的数据
 * @param {boolean} [littleEndian] 是否使用小端字节序
 * @returns {Uint8Array} 加密后的数据包
 */
export function encrypt(buffer: Uint8Array, littleEndian?: boolean): Uint8Array {
  // 获取原始数据大小
  const size = buffer.length;
  // 计算需要加密的数据块数量（每块 4 字节）
  const encryptBlocks = Math.ceil(size / 4);
  // 获取对齐后的数据大小
  const alignedSize = encryptBlocks * 4;
  // 创建数据包
  const packet = new Uint8Array(Packet.HEAD_SIZE + alignedSize);
  // 生成初始密钥
  const [key] = crypto.getRandomValues(new Uint32Array(1));
  // 创建数据包视图
  const packetView = new DataView(packet.buffer);

  // 写入加密后的初始密钥到包头
  packetView.setUint32(Packet.KEY_OFFSET, key ^ SECURITY_KEY, littleEndian);

  // 拷贝原始数据到包中
  packet.set(buffer, Packet.HEAD_SIZE);

  // 创建 XOR 密钥
  let xorKey = deriveXorKey(key);

  // 循环加密数据，每块 4 字节
  for (let offset = 0; offset < encryptBlocks; offset++) {
    // 加密数据块并更新密钥
    xorKey = encryptBlock(packetView, offset, xorKey, littleEndian);
  }

  // 实际使用的数据长度
  const length = Packet.HEAD_SIZE + size;
  // 计算校验码，确保数据完整性
  const checksum = crc32c(packet, Packet.KEY_OFFSET, length);

  // 写入加密后的校验码到包头
  packetView.setUint32(Packet.CHECKSUM_OFFSET, checksum ^ key, littleEndian);

  // 返回实际使用的数据长度（去除填充）
  return packet.subarray(0, length);
}

/**
 * @function decrypt
 * @description 对数据包进行解密处理
 * @param {Uint8Array} packet 需要解密的数据包
 * @param {boolean} [littleEndian] 是否使用小端字节序
 * @returns {Uint8Array} 解密后的原始数据
 */
export function decrypt(packet: Uint8Array, littleEndian?: boolean): Uint8Array {
  // 获取原始数据大小
  const length = packet.length;
  // 计算需要解密的数据大小（总大小减去包头信息大小）
  const size = length - Packet.HEAD_SIZE;

  // 检查数据包大小是否有效
  if (size < 0) {
    throw new Error('invalid packet size');
  }

  // 创建数据包视图
  const packetView = new DataView(packet.buffer);
  // 从包头读取初始密钥
  const key = (packetView.getUint32(Packet.KEY_OFFSET, littleEndian) ^ SECURITY_KEY) >>> 0;
  // 从包头读取校验码
  const checksum = (packetView.getUint32(Packet.CHECKSUM_OFFSET, littleEndian) ^ key) >>> 0;

  // 校验和必须为0表示数据完整
  if (checksum !== crc32c(packet, Packet.KEY_OFFSET, length)) {
    throw new Error('checksum verification failed');
  }

  // 计算解密块数量（每块 4 字节）
  const decryptBlocks = Math.ceil(size / 4);
  // 获取对齐后的数据大小
  const alignedSize = decryptBlocks * 4;
  // 创建缓冲区用于存储对齐后的数据
  const buffer = new Uint8Array(alignedSize);

  // 拷贝加密数据部分到缓冲区
  buffer.set(packet.subarray(Packet.HEAD_SIZE));

  // 计算补齐的字节数（保证 4 字节对齐）
  const paddingSize = alignedSize - size;
  // 计算最大块偏移
  const maxBlockOffset = decryptBlocks - 1;

  // 创建 XOR 密钥
  let xorKey = deriveXorKey(key);

  // 创建缓冲区视图
  const bufferView = new DataView(buffer.buffer);

  // 循环解密数据，每块 4 字节，忽略最后一块，放后面以便补位处理
  for (let offset = 0; offset < maxBlockOffset; offset++) {
    // 解密数据块并更新密钥
    xorKey = decryptBlock(bufferView, offset, xorKey, littleEndian);
  }

  // 处理补齐字节，确保数据完整性
  if (paddingSize > 0) {
    // 写入当前密钥作为补齐数据
    paddingView.setUint32(0, xorKey, littleEndian);

    // 将补齐数据写入缓冲区末尾
    buffer.set(padding.subarray(4 - paddingSize), size);
  }

  // 解密最后一块数据块
  xorKey = decryptBlock(bufferView, maxBlockOffset, xorKey, littleEndian);

  // 提取实际数据部分（去除填充）
  return buffer.subarray(0, size);
}
