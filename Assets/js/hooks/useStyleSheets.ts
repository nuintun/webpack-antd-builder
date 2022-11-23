/**
 * @module useStyleSheets
 */

import { ReactElement, useMemo } from 'react';

import { theme } from 'antd';
import classNames from 'classnames';
import { CSSInterpolation, useStyleRegister } from '@ant-design/cssinjs';

const { useToken } = theme;

type Token = ReturnType<typeof useToken>['token'];

export interface StyleSheets {
  (token: Token, hashId?: string): CSSInterpolation;
}

/**
 * @function useStyleSheets
 * @description [hook] 动态样式生成
 * @param namespace 命名空间
 * @param styleSheets 样式生成函数
 */
export function useStyleSheets(
  namespace: string,
  styleSheets: StyleSheets
): readonly [classNames: string, render: (node: ReactElement) => ReactElement] {
  const { theme, token, hashId } = useToken();
  const options = { theme, token, hashId, path: [namespace] };

  return [
    useMemo(() => classNames(hashId, namespace), [hashId, namespace]),
    useStyleRegister(options, () => styleSheets(token, hashId))
  ];
}
