/**
 * @module .postcssrc
 * @description PostCSS 配置
 */

import targets from './webpack/lib/targets.js';

export default async mode => {
  return {
    sourceMap: mode !== 'production',
    plugins: [['autoprefixer', { flexbox: 'no-2009', env: await targets() }]]
  };
};
