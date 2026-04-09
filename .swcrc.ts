/**
 * @module .swcrc
 * @description SWC 配置模块，用于生成 JavaScript/TypeScript 编译和转换的配置选项
 */

import type { Config } from '@swc/core';
import targets from './tools/lib/targets.ts';
import type { Mode } from './tools/index.ts';

/**
 * @function swcrc
 * @description 根据打包模式生成 SWC Loader 的配置选项
 * @param mode 打包模式，'development' 或 'production'
 * @see https://swc.rs/docs/configuration/swcrc
 */
export default async function (mode: Mode): Promise<Config> {
  return {
    jsc: {
      externalHelpers: true,
      parser: {
        tsx: true,
        syntax: 'typescript'
      },
      transform: {
        react: {
          runtime: 'automatic',
          refresh: mode !== 'production'
        }
      }
    },
    env: {
      targets: await targets()
    }
  };
}
