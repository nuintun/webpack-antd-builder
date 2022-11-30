/**
 * @module useBorderSize
 */

import { theme } from 'antd';

const { useToken } = theme;

export default function useBorderSize(): number {
  const { token } = useToken();

  return token.Menu?.colorActiveBarBorderSize ?? token.lineWidth;
}
