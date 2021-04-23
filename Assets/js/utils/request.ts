/**
 * @module request
 * @description 站点异步请求函数
 */

import 'whatwg-fetch';
import { message } from 'antd';

type Query = Record<string | number, any>;

export interface Options extends Omit<RequestInit, 'body'> {
  body?: any;
  query?: Query;
  notify?: boolean;
  onUnauthorized?: () => void;
}

interface RequestResult<R> {
  code: number;
  msg: string;
  payload: R;
}

export interface RequestError extends Error {
  code: number;
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
 * @function resloveMessage
 * @param code HTTP 状态码
 */
function resloveMessage(code: number): string {
  return STATUS_TEXT[code] || `操作失败：${code}`;
}

/**
 * @function isJsonType
 * @param type 内容类型
 */
function isJsonType(type: string | null): boolean {
  return !!type && /^application\/json(;|$)/i.test(type);
}

/**
 * @function isUrlencodedType
 * @param type 内容类型
 */
function isUrlencodedType(type: string | null): boolean {
  return !!type && /^application\/x-www-form-urlencoded(;|$)/i.test(type);
}

/**
 * @function isStatusOk
 * @param status HTTP 状态码
 */
function isStatusOk(status: number): boolean {
  return status >= 200 && status < 300;
}

/**
 * @function parseResponse
 * @param response 响应内容
 */
async function parseResponse<R>(response: Response): Promise<RequestResult<R>> {
  if (isJsonType(response.headers.get('Content-Type'))) {
    const { code, msg, payload } = (await response.json()) as RequestResult<R>;

    return { code, msg: msg || resloveMessage(code), payload };
  }

  const { status } = response;
  const code = isStatusOk(status) ? 200 : status;
  const payload = ((await response.text()) as unknown) as R;

  return { code, msg: resloveMessage(code), payload };
}

/**
 * @function appendField
 * @description 新增参数
 * @param {URLSearchParams} search
 * @param {string} key
 * @param {string} value
 */
function appendField(search: URLSearchParams, key: string, value: string): void {
  value != null && search.append(key, value);
}

/**
 * @function serializeQuery
 * @description 序列化参数
 * @param {Query} values
 * @param {URLSearchParams} [search]
 */
function serializeQuery(values: Query, search: URLSearchParams = new URLSearchParams()): URLSearchParams {
  Object.keys(values).forEach(key => {
    const value = values[key];

    if (Array.isArray(value)) {
      value.forEach(value => {
        appendField(search, key, value);
      });
    } else {
      appendField(search, key, value);
    }
  });

  return search;
}

/**
 * @function serializeBody
 * @param {any} body
 * @param {boolean} useJson
 */
function serializeBody(body: any, useJson?: boolean): string | null | never {
  if (body) {
    if (useJson) return JSON.stringify(body);

    return serializeQuery(body).toString();
  }

  return null;
}

/**
 * @function request
 * @description Ajax 数据请求
 * @param {string} url
 * @param {Options} [init]
 */
export default function request<R>(url: string, init: Options = {}): Promise<R> {
  const input = new URL(url, location.href);
  const { query, notify = false, onUnauthorized, ...options } = init;

  options.cache = options.cache || 'no-cache';
  options.headers = new Headers(options.headers || {});
  options.credentials = options.credentials || 'include';

  // 查询参数
  query && serializeQuery(query, input.searchParams);

  // 请求头
  const { headers } = options;

  // 设置 XMLHttpRequest 头
  headers.set('X-Requested-With', 'XMLHttpRequest');

  // 序列化 body
  if (options.body instanceof FormData) {
    headers.delete('Content-Type');
  } else if (options.body != null) {
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');

      options.body = serializeBody(options.body);
    } else {
      const contentType = headers.get('Content-Type');

      // 检测传送数据方式
      if (isUrlencodedType(contentType)) {
        options.body = serializeBody(options.body);
      } else if (isJsonType(contentType)) {
        options.body = serializeBody(options.body, true);
      }
    }
  }

  // 发送请求
  return fetch(input.href, options).then(
    (response: Response): Promise<R> => {
      return parseResponse<R>(response).then(
        ({ code, msg, payload }) => {
          const { status } = response;

          if (isStatusOk(status) && code === 200) {
            notify && message.success(msg);

            // 操作成功
            return payload;
          }

          if (status === 401 || code === 401) {
            // 需要登录认证
            onUnauthorized && onUnauthorized();
          }

          // 其它错误，403 等
          const error = new Error(msg) as RequestError;

          error.code = code;

          throw error;
        },
        (error: RequestError): never => {
          error.code = response.status;
          error.message = '无法解析响应数据';

          throw error;
        }
      );
    },
    (error: RequestError): never => {
      error.code = 0;
      error.message = '请求失败';

      throw error;
    }
  );
}
