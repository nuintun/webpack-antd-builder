/**
 * @module path
 */

import { normalize } from 'react-nest-router';

/**
 * @function isURL
 * @description 判断路径是否为 URL
 * @param path 需要判断的路径
 */
function isURL(path: string): boolean {
  return /^(?:[a-z0-9.+-]+:)?\/\//i.test(path);
}

/**
 * @function isAbsolute
 * @description 判断路径是否为绝对路径
 * @param path 需要判断的路径
 */
function isAbsolute(path: string): boolean {
  return /^\//.test(path);
}

/**
 * @function parseURL
 * @description 解析 URL 路径
 * @param path URL 路径
 */
function parseURL(path: string): [origin: string, pathname: string, query: string] {
  const matched = path.match(/^((?:[a-z0-9.+-]+:)?\/\/[^/]+)?([^?#]*)(.*)$/i);

  if (matched) {
    const [, origin = '', pathname, query] = matched;

    return [origin, pathname, query];
  }

  return ['', '', ''];
}

/**
 * @function resolve
 * @description 计算路径
 * @param from 开始路径
 * @param to 指向路径
 */
export function resolve(from: string, to?: string): string {
  if (!to) {
    const [origin, pathname, query] = parseURL(from);

    return `${origin}${normalize(pathname)}${query}`;
  }

  if (isURL(to) || isAbsolute(to)) {
    const [origin, pathname, query] = parseURL(to);

    return `${origin}${normalize(pathname)}${query}`;
  }

  const [origin, base] = parseURL(from);
  const [, pathname, query] = parseURL(to);

  return `${origin}${normalize(base ? `${base}/${pathname}` : pathname)}${query}`;
}
