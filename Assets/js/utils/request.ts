/**
 * @module request
 * @description Ajax 请求封装
 */

import 'whatwg-fetch';
import { isObject, serialize } from './utils';

export type Body = Query | BodyInit | null;

export type Query = Record<string | number, any>;

export interface Options extends Omit<RequestInit, 'body'> {
  body?: Body;
  query?: Query;
  baseURL?: string;
  onUnauthorized?: () => void;
  onMessage?: (message: string) => void;
}

export interface RequestResult<R = unknown> {
  payload: R;
  msg: string;
  code: number;
}

export interface RequestError<R = unknown> extends Error {
  code: number;
  response?: R;
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
 * @function isJSONType
 * @param headers 请求或返回 Headers
 */
function isJSONType(headers: Headers): boolean {
  const contentType = headers.get('Content-Type');

  return !!contentType && /^application\/json(;|$)/i.test(contentType);
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
function parseResponse<R>(response: Response): Promise<RequestResult<R>> {
  if (isJSONType(response.headers)) {
    return response.json().then(({ code, msg, payload }: RequestResult<R>) => {
      return { code, msg: msg || resloveMessage(code), payload };
    });
  }

  const { status } = response;
  const code = isStatusOk(status) ? 200 : status;

  return response.text().then(payload => {
    return { code, msg: resloveMessage(code), payload } as RequestResult<R>;
  });
}

/**
 * @function serializeBody
 * @param body 消息体
 * @param json 是否使用 JSON 格式
 */
function serializeBody(body: Record<string | number, any>, json?: boolean): FormData | string {
  return json ? JSON.stringify(body) : serialize(body, new FormData());
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
  return fetch(input.href, options as RequestInit).then(
    (response: Response): Promise<R> => {
      return parseResponse<R>(response).then(
        ({ code, msg, payload }) => {
          const { status } = response;

          if (isStatusOk(status) && code === 200) {
            onMessage?.(msg);

            // 操作成功
            return payload;
          }

          if (status === 401 || code === 401) {
            // 需要登录认证
            onUnauthorized?.();
          }

          // 其它错误，403 等
          const error = new Error(msg) as RequestError;

          error.code = code;
          error.response = payload;

          throw error;
        },
        (error: RequestError): never => {
          error.code = response.status;

          if (!__DEV__) {
            error.message = '解析响应失败';
          }

          throw error;
        }
      );
    },
    (error: RequestError): never => {
      error.code = 0;

      if (!__DEV__) {
        error.message = '发送请求失败';
      }

      throw error;
    }
  );
}
