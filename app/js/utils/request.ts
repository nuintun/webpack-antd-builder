/**
 * @module request
 * @description Ajax 请求封装
 */

import { isObject } from './utils';
import { Fields, serialize, serializeBody } from './form';

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
function isStatusOk(status: number): boolean {
  return status >= 200 && status < 300;
}

/**
 * @function resloveMessage
 * @param code HTTP 状态码
 */
function resloveMessage(code: number): string {
  return STATUS_TEXT[code] || `操作失败：${code}`;
}

/**
 * @function isJSONType
 * @param headers 请求或返回 Headers
 */
function isJSONType(headers: Headers): boolean {
  const contentType = headers.get('Content-Type');

  return !!contentType && /^application\/json(;|$)/i.test(contentType);
}

/**
 * @function parseResponse
 * @param response 响应内容
 */
function parseResponse<R>(response: Response): Promise<RequestResult<R>> {
  if (isJSONType(response.headers)) {
    return response.json().then(({ code, message, payload }: RequestResult<R>) => {
      return { code, message: message || resloveMessage(code), payload };
    });
  }

  const { status } = response;
  const code = isStatusOk(status) ? 200 : status;

  return response.text().then(payload => {
    return { code, message: resloveMessage(code), payload } as RequestResult<R>;
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

    throw new RequestError(code, JSON.stringify(error), { name: 'AbortError' });
  };
}

/**
 * @function request
 * @description Ajax 数据请求
 * @param url 请求地址
 * @param init 请求配置
 */
export default function request<R>(url: string, init: Options = {}): Promise<R> {
  const { query, onMessage, baseURL = location.href, onUnauthorized, ...options } = init;

  options.cache = options.cache || 'no-cache';
  options.headers = new Headers(options.headers || {});
  options.credentials = options.credentials || 'include';

  const { body, headers } = options;
  const input = new URL(url, baseURL);

  // 查询参数
  query && serialize(query, input.searchParams);

  // 设置 XMLHttpRequest 头
  headers.set('X-Requested-With', 'XMLHttpRequest');

  // 序列化 body
  if (isObject(body) || Array.isArray(body)) {
    options.body = serializeBody(body, isJSONType(headers));
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
