/**
 * @module request
 * @description Ajax 请求封装
 */

import 'whatwg-fetch';
import { message } from 'antd';

type Query = Record<string | number, any>;

export interface Options extends Omit<RequestInit, 'body'> {
  body?: any;
  query?: Query;
  notify?: boolean;
  baseURL?: string;
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
  const payload = (await response.text()) as unknown as R;

  return { code, msg: resloveMessage(code), payload };
}

/**
 * @function appendField
 * @description 新增参数
 * @param search URLSearchParams 对象
 * @param key 参数名
 * @param value 参数值
 */
function appendField(search: URLSearchParams, key: string, value: string): void {
  value != null && search.append(key, value);
}

/**
 * @function serializeQuery
 * @description 序列化参数
 * @param values 需要序列化的参数
 * @param search URLSearchParams 对象
 */
function serializeQuery(values: Query, search: URLSearchParams = new URLSearchParams()): URLSearchParams {
  const keys = Object.keys(values);

  for (const key of keys) {
    const value = values[key];

    if (Array.isArray(value)) {
      for (const item of value) {
        appendField(search, key, item);
      }
    } else {
      appendField(search, key, value);
    }
  }

  return search;
}

/**
 * @function serializeBody
 * @param body 消息体
 * @param useJson 是否使用 JSON 格式
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
 * @param url 请求地址
 * @param init 请求配置
 */
export default function request<R>(url: string, init: Options = {}): Promise<R> {
  const { query, notify = false, baseURL = location.href, onUnauthorized, ...options } = init;

  options.cache = options.cache || 'no-cache';
  options.headers = new Headers(options.headers || {});
  options.credentials = options.credentials || 'include';

  const input = new URL(url, baseURL);

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
