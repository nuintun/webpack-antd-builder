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
 * @function dirname
 * @description 获取路径的目录
 * @param path 需要获取目录的路径
 */
function dirname(path: string): string {
  const matched = path.match(/[^?#]*\//);

  return matched === null ? '' : matched[0];
}

/**
 * @function serialize
 * @description 序列化路径
 * @param path 需要序列化的路径
 * @param serializer 序列化方法
 */
function serialize(path: string, serializer: (origin: string, pathname: string, query: string) => string) {
  return path.replace(
    /^((?:[a-z0-9.+-]+:)?\/\/[^/]+)?([^?#]*)(.*)$/i,
    (_matched: string, origin: string | undefined = '', pathname: string, query: string): string => {
      return serializer(origin, pathname, query);
    }
  );
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
      if (segments.length > 1 || segments[0] !== '') {
        segments.pop();
      }
    } else if (segment !== '.') {
      segments.push(segment);
    }
  }

  return segments.join('/');
}

/**
 * @function resolve
 * @description 计算路径
 * @param from 开始路径
 * @param to 指向路径
 */
export function resolve(from: string, to: string): string {
  if (isURL(to)) {
    return serialize(to, (origin, pathname, query) => {
      return `${origin}${normalize(pathname)}${query}`;
    });
  }

  return serialize(from, (origin, pathname, query) => {
    if (to === '') {
      return `${origin}${normalize(pathname)}${query}`;
    }

    if (isAbsolute(to)) {
      return `${origin}${normalize(to)}${query}`;
    }

    return `${origin}${normalize(`${dirname(pathname)}/${to}`)}${query}`;
  });
}
