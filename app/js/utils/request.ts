/**
 * @module request
 * @description Ajax 请求封装
 */

import * as msgpack from './msgpack';
import { Fields, serialize } from './form';
import { isBigInt, isObject } from './utils';

export type Query = Fields;

export type Body = Fields | BodyInit | null;

export interface RequestResult<R = unknown> {
  payload: R;
  code: number;
  message: string;
}

export interface RequestErrorOptions extends ErrorOptions {
  name?: string;
  stack?: string;
}

export interface Options extends Omit<RequestInit, 'body'> {
  body?: Body;
  query?: Query;
  baseURL?: string;
  onUnauthorized?: () => void;
  onMessage?: (message: string) => void;
}

const STATUS_TEXT: Record<number, string> = {
  200: '操作成功',
  401: '未经授权',
  403: '无权操作',
  404: '接口未找到',
  500: '服务器错误',
  502: '网关错误',
  503: '服务不可用',
  504: '网关超时'
};

/**
 * @function isStatusOk
 * @param status HTTP 状态码
 */
export function isStatusOk(status: number): boolean {
  return status >= 200 && status < 300;
}

/**
 * @function resolveMessage
 * @param code HTTP 状态码
 */
export function resolveMessage(code: number): string {
  return STATUS_TEXT[code] || `操作失败：${code}`;
}

/**
 * @function stringify
 * @param value 要序列化的数据
 */
export function stringify(value: any): string {
  return JSON.stringify(value, (_key, value) => {
    if (isBigInt(value)) {
      return value.toString();
    }

    if (value !== null) {
      return value;
    }
  });
}

/**
 * @function isJsonType
 * @param contentType 内容类型
 */
export function isJsonType(contentType: string | null): boolean {
  return !!contentType && /^application\/json(;|$)/i.test(contentType);
}

/**
 * @function isMsgpackType
 * @param contentType 内容类型
 */
export function isMsgpackType(contentType: string | null): boolean {
  return !!contentType && /^application\/x-msgpack(;|$)/i.test(contentType);
}

/**
 * @function parseResponse
 * @param response 响应内容
 */
function parseResponse<R>(response: Response): Promise<RequestResult<R>> {
  const contentType = response.headers.get('Content-Type');

  if (isMsgpackType(contentType)) {
    const body = response.body || new ReadableStream();

    return msgpack.decodeAsync<RequestResult<R>>(body).then(({ code, message, payload }) => {
      return { code, message: message || resolveMessage(code), payload };
    });
  } else if (isJsonType(contentType)) {
    return response.json().then(({ code, message, payload }: RequestResult<R>) => {
      return { code, message: message || resolveMessage(code), payload };
    });
  }

  const { status } = response;
  const code = isStatusOk(status) ? 200 : status;

  return response.text().then(payload => {
    return { code, message: resolveMessage(code), payload } as RequestResult<R>;
  });
}

export class RequestError extends Error {
  public code: number;

  constructor(code: number, message: string, options?: RequestErrorOptions) {
    super(message, options);

    this.code = code;

    if (options) {
      const { name, stack } = options;

      if (name) {
        this.name = name;
      }

      if (stack) {
        this.stack = stack;
      }
    }
  }
}

function createErrorCatch(code: number): (error: Error | DOMException | string) => never {
  return error => {
    if (error instanceof Error) {
      throw new RequestError(code, error.message, error);
    }

    throw new RequestError(code, error, { name: 'AbortError' });
  };
}

/**
 * @function request
 * @description Ajax 数据请求
 * @param url 请求地址
 * @param init 请求配置
 */
export default function request<R>(url: string, init: Options = {}): Promise<R> {
  const { query, onMessage, baseURL = self.location.href, onUnauthorized, ...options } = init;

  options.cache = options.cache || 'no-cache';
  options.headers = new Headers(options.headers || {});
  options.credentials = options.credentials || 'include';

  const input = new URL(url, baseURL);
  const { body, headers, method = 'GET' } = options;

  // 请求方法，PATCH 非大写会跨域失败
  options.method = method.toUpperCase();

  // 查询参数
  query && serialize(query, input.searchParams);

  // 设置 XMLHttpRequest 头
  headers.set('X-Requested-With', 'XMLHttpRequest');

  // 序列化 body
  if (isObject(body) || Array.isArray(body)) {
    const contentType = headers.get('Content-Type');

    if (isMsgpackType(contentType)) {
      options.body = msgpack.encode(body);
    } else if (isJsonType(contentType)) {
      options.body = stringify(body);
    } else {
      options.body = serialize(body, new FormData());
    }
  }

  // 发送请求
  return fetch(input.href, options as RequestInit).then((response: Response): Promise<R> => {
    return parseResponse<R>(response).then(({ code, message, payload }) => {
      const { status } = response;

      if (isStatusOk(status) && code === 200) {
        onMessage?.(message);

        // 操作成功
        return payload;
      }

      if (status === 401 || code === 401) {
        // 需要登录认证
        onUnauthorized?.();
      }

      // 其它错误，403 等
      throw new RequestError(code, message);
    }, createErrorCatch(response.status));
  }, createErrorCatch(-1));
}
