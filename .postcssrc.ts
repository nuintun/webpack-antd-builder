/**
 * @module .postcssrc
 * @description PostCSS 配置文件，用于处理 CSS 前缀和 Source Map 设置
 */

import autoprefixer from 'autoprefixer';
import { targets } from './tools/index.ts';
import type { Mode } from './tools/index.ts';
import type { AcceptedPlugin, ProcessOptions } from 'postcss';

/**
 * @interface
 * @description PostCSS 配置接口
 */
interface Config extends ProcessOptions {
  plugins: AcceptedPlugin[];
}

/**
 * @function postcssrc
 * @description 生成 PostCSS 配置对象
 * @param mode 打包模式，'development' 或 'production'
 */
export default async function (mode: Mode): Promise<Config> {
  const env = await targets();

  return {
    map: mode !== 'production',
    plugins: [
      autoprefixer({
        flexbox: 'no-2009',
        env: env.join('\n')
      })
    ]
  };
}
