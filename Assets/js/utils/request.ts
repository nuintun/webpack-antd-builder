/**
 * @module request
 * @description 站点异步请求函数
 */

import 'whatwg-fetch';
import { message } from 'antd';

type Query = { [key: string]: any; [key: number]: any };

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

const STATUS_TEXT: { [code: number]: string } = {
  0: '请求失败',
  401: '未经授权',
  403: '无权操作',
  404: '接口未找到',
  500: '服务器错误',
  502: '网关错误',
  503: '服务不可用',
  504: '网关超时'
};

/**
 * @function getStatusMessage
 * @param code HTTP 状态码
 */
function getStatusMessage(code: number): string {
  return STATUS_TEXT[code] || `其它错误：${code}`;
}

/**
 * @function jsonType
 * @param type 返回类型
 */
function jsonType(type: string | null): boolean {
  return !!type && /^application\/json(?:;|$)/i.test(type);
}

/**
 * @function urlencodedType
 * @param type 发送类型
 */
function urlencodedType(type: string | null): boolean {
  return !!type && /^application\/x-www-form-urlencoded(?:;|$)/i.test(type);
}

/**
 * @function jsonParser
 * @param response 响应对象
 * @param notify 是否显示通知
 * @param onUnauthorized 需要鉴权回调
 */
function jsonParser<R>(response: Response, notify: boolean, onUnauthorized?: () => void): Promise<R> {
  return response.json().then(
    (json: RequestResult<R>): R => {
      const { code, msg, payload } = json;

      switch (code) {
        case 200:
          notify && message.success(msg);

          // 操作成功
          return payload;
        case 401:
          // 需要登录认证
          onUnauthorized && onUnauthorized();
        default:
          // 其它错误，403 等
          const error = new Error(msg || getStatusMessage(code)) as RequestError;

          error.code = code;

          throw error;
      }
    },
    (error: RequestError): never => {
      error.code = response.status;
      error.message = '数据解析失败，请检查数据返回格式';

      throw error;
    }
  );
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
 * @function bodySerializer
 * @param {any} body
 * @param {boolean} jsonType
 */
function bodySerializer(body: any, jsonType?: boolean): string | null | never {
  if (body) {
    if (jsonType) return JSON.stringify(body);

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

      options.body = bodySerializer(options.body);
    } else {
      const contentType = headers.get('Content-Type');

      // 检测传送数据方式
      if (urlencodedType(contentType)) {
        options.body = bodySerializer(options.body);
      } else if (jsonType(contentType)) {
        options.body = bodySerializer(options.body, true);
      }
    }
  }

  // 发送请求
  return fetch(input.href, options).then(
    (response: Response): Promise<R> => {
      switch (response.status) {
        case 200:
          // 根据类型解析返回结果
          return jsonType(response.headers.get('Content-Type'))
            ? jsonParser<R>(response, notify, onUnauthorized)
            : ((response.text() as unknown) as Promise<R>);
        case 401:
          // 需要登录认证
          onUnauthorized && onUnauthorized();
        default:
          // 其它错误，403，404，500 等
          const { status }: Response = response;
          const error = new Error(getStatusMessage(status)) as RequestError;

          error.code = status;

          throw error;
      }
    },
    (error: RequestError): never => {
      error.code = 0;
      error.message = getStatusMessage(error.code);

      throw error;
    }
  );
}
