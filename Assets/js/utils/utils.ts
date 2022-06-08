/**
 * @module utils
 */

import dayjs, { Dayjs, ManipulateType, OpUnitType } from 'dayjs';

/**
 * @function assert
 * @param cond Assert flags.
 * @param message Assert error message.
 */
export function assert<T>(cond: T, message: string): asserts cond {
  if (!cond) throw new Error(message);
}

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
  return Object.prototype.toString.call(value) === '[object String]';
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
        if (item != null) {
          search.append(key, item);
        }
      }
    } else if (value != null) {
      search.append(key, value);
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
 * @description 获取当前时间向前指定偏移的时间区间
 * @param value 偏移值
 * @param unit 偏移单位
 */
export function getLastRangeDate(value: number, unit: ManipulateType = 'day'): [start: Dayjs, end: Dayjs] {
  const today = dayjs();

  return [today.subtract(Math.max(0, /^d(ay)?$/.test(unit) ? value - 1 : value), unit), today];
}

/**
 * @function getThisRangeDate
 * @description 获取当前时间所在的指定范围日期区间
 * @param unit 指定范围
 * @param overflow 是否能超过当前时间
 */
export function getThisRangeDate(unit: OpUnitType = 'day', overflow: boolean = false): [start: Dayjs, end: Dayjs] {
  const today = dayjs();

  return [today.startOf(unit), overflow ? today.endOf(unit) : today];
}
