/**
 * @module createStyles
 */

import { useMemo } from 'react';
import { isNumber, isString } from '/js/utils/utils';
import useToken, { unitless as unitlessSeeds } from 'antd/es/theme/useToken';
import { AliasToken, GlobalToken, OverrideToken } from 'antd/es/theme/interface';
import { AbstractCalculator, CSSInterpolation, genCalc, token2CSSVar, unit, useStyleRegister } from '@ant-design/cssinjs';

interface UseStyles {
  (): string;
}

type Components = keyof OverrideToken;

type Entries<T> = [keyof AliasToken, T][];

interface CSSUtils {
  unit(value: string | number): string;
  calc(value: number | string): AbstractCalculator;
}

interface Styles<C extends Components> {
  (token: Token<C>, utils: CSSUtils): CSSInterpolation;
}

type ComponentToken = {
  [key in keyof AliasToken]: string | number | boolean;
};

type Token<C extends Components> = AliasToken & Pick<OverrideToken, C>;

function prefixToken(component: string, key: string): string {
  return `${component}${key.replace(/^[a-z]/, match => {
    return match.toUpperCase();
  })}`;
}

/**
 * @function createStyles
 * @description [hook] 动态样式生成
 * @param path 路径片段数组
 * @param styles 样式生成函数
 * @param shared 共享样式的组件列表
 */
export default function createStyles<C extends Components = never>(path: string[], styles: Styles<C>, shared?: C[]): UseStyles {
  return () => {
    const [theme, realToken, hashId, token, cssVar] = useToken();

    const mergedToken = useMemo<Token<C>>(() => {
      const { motion, wireframe } = realToken;
      const mergedToken = { ...token, motion, wireframe };

      if (shared) {
        for (const component of shared) {
          const sharedToken = realToken[component];
          const componentToken: Partial<ComponentToken> = {};

          if (sharedToken) {
            let length = 0;

            const entries = Object.entries(sharedToken) as Entries<string | number | boolean>;

            for (const [key, token] of entries) {
              if (isString(token) || isNumber(token)) {
                const globalToken = realToken[key];

                if (token !== globalToken) {
                  length++;

                  if (cssVar) {
                    const cssVarPrefix = cssVar.prefix;
                    const suffix = globalToken != null ? '' : `-${component}`;
                    const prefix = cssVarPrefix ? `${cssVarPrefix}${suffix}` : component;

                    componentToken[key] = `var(${token2CSSVar(key, prefix)})`;
                  } else {
                    componentToken[key] = token;
                  }
                }
              } else if (key === 'motion' || key === 'wireframe') {
                length++;

                componentToken[key] = token;
              }
            }

            if (length > 0) {
              mergedToken[component] = componentToken as GlobalToken[C];
            }
          }
        }
      }

      return mergedToken;
    }, [token, realToken, cssVar]);

    const unitless = useMemo<Record<string, boolean>>(() => {
      const unitless: Record<string, boolean> = { ...unitlessSeeds };

      if (shared) {
        for (const component of shared) {
          unitless[prefixToken(component, 'zIndexPopup')] = true;

          for (const key in unitless) {
            unitless[prefixToken(component, key)] = true;
          }
        }
      }

      return unitless;
    }, [shared]);

    const utils = useMemo(() => {
      const type = cssVar ? 'css' : 'js';
      const unitlessCssVar = new Set(Object.keys(unitless));

      return { unit, calc: genCalc(type, unitlessCssVar) };
    }, [cssVar, unitless]);

    useStyleRegister({ path, theme, token: mergedToken, hashId }, () => {
      return styles(mergedToken, utils);
    });

    return useMemo<string>(() => {
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
  };
}
