/**
 * @module .postcssrc
 * @description PostCSS 配置
 */

'use strict';

module.exports = {
  sourceMap: process.env.NODE_ENV !== 'production',
  plugins: [['autoprefixer', { flexbox: 'no-2009' }]]
};
