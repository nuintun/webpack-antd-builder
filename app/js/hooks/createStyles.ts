/**
 * @module createStyles
 */

import { isObject } from '/js/utils/utils';
import genCalc from 'antd/es/theme/util/calc';
import useToken from 'antd/es/theme/useToken';
import { ReactElement, useMemo } from 'react';
import { GlobalToken, ThemeConfig } from 'antd';
import genMaxMin from 'antd/es/theme/util/maxmin';
import AbstractCalculator from 'antd/es/theme/util/calc/calculator';
import { CSSInterpolation, token2CSSVar, unit, useStyleRegister } from '@ant-design/cssinjs';

export interface UseStyles {
  (): [
    // 样式作用域类型
    scope: string,
    // 注入样式渲染函数
    render: (node: ReactElement) => ReactElement
  ];
}

export interface Styles {
  (token: Token, utils: CSSUtils): CSSInterpolation;
}

export interface CSSUtils {
  unit(value: string | number): string;
  calc(value: number | string): AbstractCalculator;
  max(...values: (number | string)[]): number | string;
  min(...values: (number | string)[]): number | string;
}

export type Token = GlobalToken & ThemeConfig['components'];

function getPrefix(component: string, prefix?: string): string {
  if (prefix) {
    return `${prefix}-${component}`;
  }

  return component;
}

/**
 * @function createStyles
 * @description [hook] 动态样式生成
 * @param path 路径片段数组
 * @param styles 样式生成函数
 */
export function createStyles(path: string[], styles: Styles): UseStyles {
  return () => {
    const [theme, realToken, hashId, token, cssVar] = useToken();

    const mergedToken = useMemo<Token>(() => {
      if (cssVar) {
        const mergedToken: Token = { ...token };

        for (const [component, tokens] of Object.entries(realToken)) {
          if (isObject(tokens)) {
            const componentTokens: Record<string, string> = {};

            for (const token of Object.keys(tokens)) {
              const prefix = getPrefix(component, cssVar.prefix);

              componentTokens[token] = `var(${token2CSSVar(token, prefix)})`;
            }

            // @ts-ignore
            mergedToken[component] = componentTokens;
          }
        }

        return mergedToken;
      }

      return realToken;
    }, [token, realToken, cssVar]);

    const scope = useMemo<string>(() => {
      const scopes: string[] = [];

      if (hashId) {
        scopes.push(hashId);
      }

      if (cssVar) {
        const { key } = cssVar;

        if (key) {
          scopes.push(key);
        }
      }

      return scopes.join(' ');
    }, [hashId, cssVar]);

    const render = useStyleRegister({ path, theme, token, hashId }, () => {
      const type = cssVar ? 'css' : 'js';
      const { max, min } = genMaxMin(type);

      return styles(mergedToken, { min, max, unit, calc: genCalc(type) });
    });

    return [scope, render];
  };
}
