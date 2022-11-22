/**
 * @module .postcssrc
 * @description PostCSS 配置
 */

import browsers from './webpack/lib/browsers.js';

export default async mode => {
  return {
    sourceMap: mode !== 'production',
    plugins: [['autoprefixer', { flexbox: 'no-2009', env: await browsers() }]]
  };
};
