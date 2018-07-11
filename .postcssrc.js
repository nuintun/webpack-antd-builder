/**
 * @module .postcssrc
 * @listens MIT
 * @author nuintun
 * @description PostCSS configure.
 */

'use strict';

const rucksack = require('rucksack-css');
const autoprefixer = require('autoprefixer');

const sourceMap = process.env.NODE_ENV !== 'production';

module.exports = {
  sourceMap,
  plugins: [
    rucksack(),
    autoprefixer({
      flexbox: 'no-2009',
      browsers: ['last 2 versions', 'Firefox ESR', '> 1%', 'ie >= 10', 'iOS >= 8', 'Android >= 4']
    })
  ]
};
