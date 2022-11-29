/**
 * @module useStyleSheets
 */

import { ReactElement } from 'react';

import { theme } from 'antd';
import { CSSInterpolation, useStyleRegister } from '@ant-design/cssinjs';

const { useToken } = theme;

type Token = ReturnType<typeof useToken>['token'];

export interface Render {
  (node: ReactElement): ReactElement;
}

export interface StyleSheets {
  (token: Token, hashId?: string): CSSInterpolation;
}

/**
 * @function useStyleSheets
 * @description [hook] 动态样式生成
 * @param path 路径片段数组
 * @param styleSheets 样式生成函数
 */
export function useStyleSheets(path: string[], styleSheets: StyleSheets): Render {
  const { theme, token } = useToken();
  const options = { theme, token, path };

  return useStyleRegister(options, () => styleSheets(token));
}
