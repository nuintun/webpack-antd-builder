/**
 * @module path
 */

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
 * @function resolveURL
 * @description 解析 URL 路径
 * @param path URL 路径
 */
function resolveURL(path: string): ReturnType<Resolver> {
  const matched = path.match(/^((?:[a-z0-9.+-]+:)?\/\/[^/]+)?([^?#]*)(.*)$/i);

  if (matched) {
    const [, origin = '', pathname, query] = matched;

    return [origin, pathname, query];
  }

  return ['', '', ''];
}

/**
 * @function normalize
 * @description 标准化路径
 * @param path 需要标准化的路径
 */
export function normalize(path: string): string {
  const segments: string[] = [];
  const paths = path.split(/\/+/);

  for (const segment of paths) {
    if (segment === '..') {
      if (segments.length > 1 || segments[0]) {
        segments.pop();
      }
    } else if (segment !== '.') {
      segments.push(segment);
    }
  }

  return segments.join('/');
}

export type Resolver = (path: string) => [origin: string, pathname: string, query: string];

/**
 * @function resolve
 * @description 计算路径
 * @param from 开始路径
 * @param to 指向路径
 */
export function resolve(from: string, to: string, resolver: Resolver = resolveURL): string {
  if (!to) {
    const [origin, pathname, query] = resolver(from);

    return `${origin}${normalize(pathname)}${query}`;
  }

  if (isURL(to) || isAbsolute(to)) {
    const [origin, pathname, query] = resolver(to);

    return `${origin}${normalize(pathname)}${query}`;
  }

  const [origin, base] = resolver(from);
  const [, pathname, query] = resolver(to);

  return `${origin}${normalize(base ? `${base}/${pathname}` : pathname)}${query}`;
}
