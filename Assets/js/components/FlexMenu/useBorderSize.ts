/**
 * @module useBorderSize
 */

import { theme } from 'antd';
import { Token } from '/js/hooks/useStyleSheets';

const { useToken } = theme;

export function getBorderSize(token: Token): number {
  return token.Menu?.colorActiveBarBorderSize ?? token.lineWidth;
}

export default function useBorderSize(): number {
  return getBorderSize(useToken().token);
}
