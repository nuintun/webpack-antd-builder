/**
 * @module isURL
 */

// prettier-ignore
const reg = /(((^https?:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+(?::\d+)?|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)$/;

/**
 * @function isURL
 * @description 检查路径是否为 URL
 * @param path 路径
 */
export default (path: string): boolean => reg.test(path);
