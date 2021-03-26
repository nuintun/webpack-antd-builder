/**
 * @module utils
 */

import dayjs from './dayjs';
import { Dayjs, OpUnitType } from 'dayjs';
import { debounce as originDebounce } from 'throttle-debounce';

const { toString } = Object.prototype;

/**
 * @type {isBrowser}
 * @description 是否为浏览器环境
 */
export const isBrowser = typeof window !== 'undefined' && window.document;

/**
 * @function isString
 * @description 是否为字符串
 * @param {any} value
 * @returns {boolean}
 */
export function isString(value: any): value is string {
  return toString.call(value) === '[object String]';
}

/**
 * @function isFunction
 * @description 是否为函数
 * @param {any} value
 * @returns {boolean}
 */
export function isFunction(value: any): value is Function {
  return typeof value === 'function';
}

/**
 * @function formatThousands
 * @description 格式化数字
 * @param {number} number
 * @param {number} precision
 * @returns {string}
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
 * @param {string} html
 * @returns {object}
 */
export function createMarkup(html: string): { __html: string } {
  return { __html: html };
}

// type DebounceDecorator = <T>(
//   target: Object,
//   propertyKey: string | symbol,
//   descriptor: TypedPropertyDescriptor<T> & { initializer?: () => any }
// ) => (TypedPropertyDescriptor<T> & { initializer?: () => any }) | void;

/**
 * @function debounce
 * @description debounce 修饰器
 * @param {number} delay
 * @param {boolean} atBegin
 * @returns {function}
 */
export function debounce(delay: number, atBegin: boolean = false): MethodDecorator {
  return function debounce(_target, propertyKey, descriptor) {
    const { writable, enumerable, configurable } = descriptor;

    return {
      enumerable,
      configurable,
      get: function () {
        // Attach this function to the instance (not the class)
        Object.defineProperty(this, propertyKey, {
          writable,
          enumerable,
          configurable,
          value: originDebounce(delay, atBegin, descriptor.value as any)
        });

        return this[propertyKey];
      }
    };
  };
}

/**
 * @function urlToPaths
 * @description 将 URL 拆分成路径列表
 * @param {string} url
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
 * @param {number} value
 * @param {OpUnitType} [unit]
 */
export function getLastRangeDate(value: number, unit: OpUnitType = 'day'): Dayjs[] {
  const today = dayjs();

  return [today.subtract(Math.max(0, value - 1), unit), today];
}
