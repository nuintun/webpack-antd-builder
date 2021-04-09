/**
 * @module utils
 */

import { Duration, sub as subDate } from 'date-fns';

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
 * @function isFunction
 * @description 是否为函数
 * @param value 需要验证的值
 */
export function isFunction(value: any): value is Function {
  return typeof value === 'function';
}

/**
 * @function formatThousands
 * @description 格式化数字
 * @param number 需要格式话的数字
 * @param precision 小数位保留个数
 */
export function formatThousands(number: number | string | undefined = 0, precision: number = 2): string {
  number = Number(number);

  const { Intl } = globalThis;

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
 * @function urlToPaths
 * @description 将 URL 拆分成路径列表
 * @param url URL 地址
 */
export function urlToPaths(url: string): string[] {
  if (url === '/') {
    return ['/'];
  }

  const paths = url.split('/').filter(path => path);

  return paths.map((_path, index) => `/${paths.slice(0, index + 1).join('/')}`);
}

/**
 * @function getLastRangeDate
 * @description 获取今天向前指定偏移的时间区间
 * @param value 偏移值
 * @param unit 偏移单位
 */
export function getLastRangeDate(duration: Duration): [start: Date, end: Date] {
  const today = new Date();

  return [subDate(today, duration), today];
}
