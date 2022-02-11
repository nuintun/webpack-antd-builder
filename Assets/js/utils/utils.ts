/**
 * @module utils
 */

import dayjs, { Dayjs, OpUnitType } from 'dayjs';

const { toString } = Object.prototype;

/**
 * @type {isBrowser}
 * @description 是否为浏览器环境
 */
export const isBrowser = typeof window !== 'undefined' && window.document;

/**
 * @function isString
 * @description 是否为字符串
 * @param value 需要验证的值
 */
export function isString(value: any): value is string {
  return toString.call(value) === '[object String]';
}

/**
 * @function isNull
 * @description 是否为空值
 * @param value 需要验证的值
 */
export function isNull(value: any): value is null {
  return value === null;
}

/**
 * @function isUndef
 * @description 是否为未定义
 * @param value 需要验证的值
 */
export function isUndef(value: any): value is void;
export function isUndef(value: any): value is undefined {
  return value === undefined;
}

/**
 * @function isNullable
 * @description 是否为空值或未定义
 * @param value 需要验证的值
 */
export function isNullable(value: any): value is null;
export function isNullable(value: any): value is void;
export function isNullable(value: any): value is undefined {
  return value == null;
}

/**
 * @function isFunction
 * @description 是否为函数
 * @param value 需要验证的值
 */
export function isFunction(value: any): value is Function {
  return typeof value === 'function';
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
export function serializeQuery(values: Record<string | number, any>, search = new URLSearchParams()): string {
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

  return search.toString();
}

/**
 * @function formatThousands
 * @description 格式化数字
 * @param number 需要格式话的数字
 * @param precision 小数位保留个数
 */
export function formatThousands(number: number | string | undefined = 0, precision: number = 2): string {
  number = Number(number);

  const { Intl } = window;

  if (Intl) {
    return new Intl.NumberFormat('en-us', {
      minimumFractionDigits: precision,
      maximumFractionDigits: precision
    }).format(number);
  }

  const parts = number.toFixed(precision).split('.');

  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  return parts.join('.');
}

/**
 * @function createMarkup
 * @description 生成 React HTML 字符串
 * @param html HTML 字符串
 */
export function createMarkup(html: string): { __html: string } {
  return { __html: html };
}

/**
 * @function pathToPaths
 * @description 将路径拆分为层级路径数组
 * @param path 需要拆分路径
 */
export function pathToPaths(path: string): string[] {
  const pattern = /[^/]+/g;
  const paths: string[] = [];
  const isAbsolute = path[0] === '/';

  while (true) {
    const match = pattern.exec(path);

    if (match === null) break;

    const [segment] = match;
    const { length } = paths;

    if (length > 0) {
      paths.push(`${paths[length - 1]}/${segment}`);
    } else {
      paths.push(isAbsolute ? `/${segment}` : segment);
    }
  }

  return isAbsolute && paths.length === 0 ? ['/'] : paths;
}

/**
 * @function getLastRangeDate
 * @description 获取今天向前指定偏移的时间区间
 * @param value 偏移值
 * @param unit 偏移单位
 */
export function getLastRangeDate(value: number, unit: OpUnitType = 'day'): [start: Dayjs, end: Dayjs] {
  const today = dayjs();

  return [today.subtract(Math.max(0, /^d(ay)?$/.test(unit) ? value - 1 : value), unit), today];
}
