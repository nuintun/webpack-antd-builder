/**
 * @module createStyles
 */

import createCalc from 'antd/es/theme/util/calc';
import createMaxMin from 'antd/es/theme/util/maxmin';
import { isNumber, isString } from '/js/utils/utils';
import { memo, ReactElement, useId, useMemo } from 'react';
import AbstractCalculator from 'antd/es/theme/util/calc/calculator';
import useToken, { ignore, unitless } from 'antd/es/theme/useToken';
import { AliasToken, GlobalToken, OverrideToken } from 'antd/es/theme/interface';
import { CSSInterpolation, token2CSSVar, unit, useCSSVarRegister, useStyleRegister } from '@ant-design/cssinjs';

interface CSSVar {
  key: string;
  prefix?: string;
}

interface CSSVarRegisterProps {
  token: Token;
  scope: string;
  cssVar: CSSVar;
  path: string[];
  shared: Components[];
  children?: ReactElement;
}

type Entries<T> = [keyof AliasToken, T][];

export type Components = keyof OverrideToken;

export interface UseStyles {
  (): [
    // 样式作用域类型
    scope: string,
    // 注入样式渲染函数
    render: (node: ReactElement) => ReactElement
  ];
}

export interface CSSUtils {
  unit(value: string | number): string;
  calc(value: number | string): AbstractCalculator;
  max(...values: (number | string)[]): number | string;
  min(...values: (number | string)[]): number | string;
}

export interface Styles<C extends Components = Components> {
  (token: Token<C>, utils: CSSUtils): CSSInterpolation;
}

export type Token<C extends Components = Components> = AliasToken & Pick<OverrideToken, C>;

function createScopeId(id: string): string {
  return `css-var-scope-${id.replace(/[^a-z_\d]/gi, '')}`;
}

function prefixToken(component: string, key: string): string {
  return `${component}${key.replace(/^[a-z]/, match => {
    return match.toUpperCase();
  })}`;
}

const CSSVarRegister = memo(function CSSVarRegister(props: CSSVarRegisterProps): null {
  const { path, scope, token, shared, cssVar } = props;

  const mergedUnitless = useMemo<Record<string, boolean>>(() => {
    const mergedUnitless: Record<string, boolean> = { ...unitless };

    for (const component of shared) {
      mergedUnitless[prefixToken(component, 'zIndexPopup')] = true;

      for (const key in mergedUnitless) {
        mergedUnitless[prefixToken(component, key)] = true;
      }
    }

    return mergedUnitless;
  }, [shared]);

  useCSSVarRegister(
    {
      path,
      scope,
      token,
      ignore,
      key: cssVar.key,
      prefix: cssVar.prefix,
      unitless: mergedUnitless
    },
    () => {
      const realToken = token;
      const scopeToken: Record<string, string | number> = {};

      for (const component of shared) {
        const componentToken = token[component];

        if (componentToken) {
          const entries = Object.entries(componentToken) as Entries<string | number | boolean>;

          for (const [key, token] of entries) {
            if (isString(token) || isNumber(token)) {
              const globalToken = realToken[key];

              if (globalToken !== token) {
                scopeToken[globalToken != null ? key : prefixToken(component, key)] = token;
              }
            }
          }
        }
      }

      return scopeToken;
    }
  );

  return null;
});

/**
 * @function createStyles
 * @description [hook] 动态样式生成
 * @param path 路径片段数组
 * @param styles 样式生成函数
 * @param shared 共享样式的组件列表
 */
export default function createStyles<C extends Components = never>(path: string[], styles: Styles<C>, shared?: C[]): UseStyles {
  return () => {
    const id = useId();
    const scopeId = useMemo(() => createScopeId(id), [id]);
    const [theme, realToken, hashId, token, cssVar] = useToken();

    const [mergedToken, hasScoped] = useMemo<[mergedToken: Token<C>, hasScoped: boolean]>(() => {
      let hasScoped = false;

      if (cssVar) {
        const { motion, wireframe } = realToken;
        const mergedToken = { ...token, motion, wireframe };

        if (shared) {
          const hasKey = !!cssVar.key;

          for (const component of shared) {
            const componentToken = realToken[component];
            const componentTokens: Record<string, string | boolean> = {};

            if (componentToken) {
              let length = 0;

              const entries = Object.entries(componentToken) as Entries<string | number | boolean>;

              for (const [key, token] of entries) {
                if (isString(token) || isNumber(token)) {
                  const globalToken = realToken[key];

                  if (globalToken !== token) {
                    length++;

                    hasScoped = hasKey;

                    const cssVarPrefix = cssVar.prefix;
                    const suffix = globalToken != null ? '' : `-${component}`;
                    const prefix = cssVarPrefix ? `${cssVarPrefix}${suffix}` : component;

                    componentTokens[key] = `var(${token2CSSVar(key, prefix)})`;
                  }
                } else if (key === 'motion' || key === 'wireframe') {
                  length++;

                  hasScoped = hasKey;

                  componentTokens[key] = token;
                }
              }

              if (length > 0) {
                mergedToken[component] = componentTokens as GlobalToken[C];
              }
            }
          }
        }

        return [mergedToken, hasScoped];
      }

      return [realToken, hasScoped];
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

      if (hasScoped) {
        scopes.push(scopeId);
      }

      return scopes.join(' ');
    }, [hashId, cssVar, scopeId, hasScoped]);

    const utils = useMemo(() => {
      const type = cssVar ? 'css' : 'js';
      const unitless = new Set<string>();
      const { max, min } = createMaxMin(type);

      return { min, max, unit, calc: createCalc(type, unitless) };
    }, [cssVar]);

    const render = useStyleRegister({ path, theme, token, hashId }, () => {
      return styles(mergedToken, utils);
    });

    return [
      scope,
      node => {
        return (
          <>
            {hasScoped && (
              <CSSVarRegister
                key={scope}
                path={path}
                scope={scopeId}
                shared={shared!}
                token={realToken}
                cssVar={cssVar as CSSVar}
              />
            )}
            {render(node)}
          </>
        );
      }
    ];
  };
}
