/**
 * @module utils
 */

import { Token } from '/js/hooks/useStyleSheets';

/**
 * @function getBorderSize
 * @description 获取边框大小
 * @param token 主题字段
 */
export function getBorderSize(token: Token): number {
  return token.Menu?.activeBarBorderWidth ?? token.lineWidth;
}
