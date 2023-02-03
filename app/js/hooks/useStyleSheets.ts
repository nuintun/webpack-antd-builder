/**
 * @module useStyleSheets
 */

import { ReactElement } from 'react';

import { theme } from 'antd';
import { CSSInterpolation, useStyleRegister } from '@ant-design/cssinjs';

export interface StyleSheets {
  (token: Token, hashId: string): CSSInterpolation;
}

export interface UseStyleSheets {
  readonly token: Token;
  readonly hashId: string;
  readonly render: (node: ReactElement) => ReactElement;
}

export type Token = ReturnType<typeof useToken>['token'];

const { useToken } = theme;

/**
 * @function useStyleSheets
 * @description [hook] 动态样式生成
 * @param path 路径片段数组
 * @param styleSheets 样式生成函数
 */
export function useStyleSheets(path: string[], styleSheets: StyleSheets): UseStyleSheets {
  const { theme, token, hashId } = useToken();

  const render = useStyleRegister({ path, theme, token, hashId }, () => {
    return styleSheets(token, hashId);
  });

  return { token, hashId, render };
}
