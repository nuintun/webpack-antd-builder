/**
 * @module createStyles
 */

import { isNumber, isString } from '/js/utils/utils';
import { memo, ReactElement, useId, useMemo } from 'react';
import { AbstractCalculator, genCalc } from '@ant-design/cssinjs-utils';
import { AliasToken, GlobalToken, OverrideToken } from 'antd/es/theme/interface';
import useToken, { ignore, unitless as unitlessSeeds } from 'antd/es/theme/useToken';
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
  shared?: Components[];
  children?: ReactElement;
  unitless: Record<string, boolean>;
}

type Components = keyof OverrideToken;

type Entries<T> = [keyof AliasToken, T][];

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
}

export interface Styles<C extends Components = Components> {
  (token: Token<C>, utils: CSSUtils): CSSInterpolation;
}

type ComponentTokens = { [key in keyof AliasToken]: string | number | boolean };

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
  const { path, scope, token, shared, cssVar, unitless } = props;

  useCSSVarRegister(
    {
      path,
      scope,
      token,
      ignore,
      unitless,
      key: cssVar.key,
      prefix: cssVar.prefix
    },
    () => {
      const scopeToken: Record<string, string | number> = {};

      if (shared) {
        for (const component of shared) {
          const sharedToken = token[component];

          if (sharedToken) {
            const entries = Object.entries(sharedToken) as Entries<string | number | boolean>;

            for (const [key, realToken] of entries) {
              if (isString(realToken) || isNumber(realToken)) {
                const globalToken = token[key];

                if (realToken !== globalToken) {
                  scopeToken[globalToken != null ? key : prefixToken(component, key)] = realToken;
                }
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
            const sharedToken = realToken[component];
            const componentToken: Partial<ComponentTokens> = {};

            if (sharedToken) {
              let length = 0;

              const entries = Object.entries(sharedToken) as Entries<string | number | boolean>;

              for (const [key, token] of entries) {
                if (isString(token) || isNumber(token)) {
                  const globalToken = realToken[key];

                  if (token !== globalToken) {
                    length++;

                    hasScoped = hasKey;

                    const cssVarPrefix = cssVar.prefix;
                    const suffix = globalToken != null ? '' : `-${component}`;
                    const prefix = cssVarPrefix ? `${cssVarPrefix}${suffix}` : component;

                    componentToken[key] = `var(${token2CSSVar(key, prefix)})`;
                  }
                } else if (key === 'motion' || key === 'wireframe') {
                  length++;

                  hasScoped = hasKey;

                  componentToken[key] = token;
                }
              }

              if (length > 0) {
                mergedToken[component] = componentToken as GlobalToken[C];
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
                shared={shared}
                token={realToken}
                unitless={unitless}
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
