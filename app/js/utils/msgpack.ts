/**
 * @module msgpack
 */

import dayjs from 'dayjs';
import * as msgpack from '@msgpack/msgpack';

const useBigInt64 = true;

const extensionCodec = new msgpack.ExtensionCodec();

extensionCodec.register({
  type: msgpack.EXT_TIMESTAMP,
  encode(value) {
    if (dayjs.isDayjs(value)) {
      value = value.toDate();
    }

    return msgpack.encodeTimestampExtension(value);
  },
  decode(data) {
    return dayjs(msgpack.decodeTimestampExtension(data));
  }
});

/**
 * @function encode
 * @description 同步编码数据
 * @param object 需要编码的数据
 */
export function encode<T = unknown>(object: T): Uint8Array {
  return msgpack.encode(object, {
    useBigInt64,
    extensionCodec,
    ignoreUndefined: true,
    initialBufferSize: 8192
  });
}

/**
 * @function decode
 * @description 同步解码数据
 * @param buffer 需要解码的数据
 */
export function decode<T = unknown>(buffer: Parameters<typeof msgpack.decode>[0]): T {
  return msgpack.decode(buffer, {
    useBigInt64,
    extensionCodec
  }) as T;
}

/**
 * @function decodeAsync
 * @description 异步解码流数据
 * @param stream 需要解码的流数据
 */
export function decodeAsync<T = unknown>(stream: Parameters<typeof msgpack.decodeAsync>[0]): Promise<T> {
  return msgpack.decodeAsync(stream, {
    useBigInt64,
    extensionCodec
  }) as Promise<T>;
}
