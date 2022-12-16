/**
 * @module .postcssrc
 * @description PostCSS 配置
 */

import targets from './tools/lib/targets.js';

/**
 * @param {string} mode
 * @return {Promise<import('postcss').ProcessOptions & { sourceMap?: boolean; plugins?: import('postcss').Plugin[] }>}
 */
export default async mode => {
  return {
    sourceMap: mode !== 'production',
    plugins: [['autoprefixer', { flexbox: 'no-2009', env: await targets() }]]
  };
};
