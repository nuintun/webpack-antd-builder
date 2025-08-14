/**
 * @module msgpack
 */

import dayjs from 'dayjs';
import {
  Decoder,
  decodeTimestampExtension,
  Encoder,
  encodeTimestampExtension,
  EXT_TIMESTAMP,
  ExtensionCodec
} from '@msgpack/msgpack';

const useBigInt64 = true;

const extensionCodec = new ExtensionCodec();

extensionCodec.register({
  type: EXT_TIMESTAMP,
  encode(value) {
    if (dayjs.isDayjs(value)) {
      value = value.toDate();
    }

    return encodeTimestampExtension(value);
  },
  decode(data) {
    return dayjs(decodeTimestampExtension(data));
  }
});

const encoder = new Encoder({
  useBigInt64,
  extensionCodec,
  ignoreUndefined: true
});

const decoder = new Decoder({
  useBigInt64,
  extensionCodec
});

/**
 * @function encode
 * @description 同步编码数据
 * @param object 需要编码的数据
 */
export const encode = encoder.encodeSharedRef.bind(encoder);

/**
 * @function decode
 * @description 同步解码数据
 * @param buffer 需要解码的数据
 */
export const decode = decoder.decode.bind(decoder);

// utility for whatwg streams
// The living standard of whatwg streams says
// ReadableStream is also AsyncIterable, but
// as of June 2019, no browser implements it.
// See https://streams.spec.whatwg.org/ for details
export type ReadableStreamLike<T> = AsyncIterable<T> | ReadableStream<T>;

function isAsyncIterable<T>(stream: ReadableStreamLike<T>): stream is AsyncIterable<T> {
  return (stream as any)[Symbol.asyncIterator] != null;
}

async function* asyncIterableFromStream<T>(stream: ReadableStream<T>): AsyncIterable<T> {
  const reader = stream.getReader();

  try {
    while (true) {
      const result = await reader.read();

      if (result.done) {
        break;
      }

      yield result.value;
    }
  } finally {
    reader.releaseLock();
  }
}

/**
 * @function decodeAsync
 * @description 异步解码流数据
 * @param stream 需要解码的流数据
 */
export function decodeAsync<T>(stream: ReadableStreamLike<ArrayLike<number> | BufferSource>): Promise<T> {
  return decoder.decodeAsync(isAsyncIterable(stream) ? stream : asyncIterableFromStream(stream)) as Promise<T>;
}
