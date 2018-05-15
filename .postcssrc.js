/**
 * @module .postcssrc
 * @listens MIT
 * @author nuintun
 * @description PostCSS configure.
 */

'use strict';

const rucksack = require('rucksack-css');
const autoprefixer = require('autoprefixer');

const development = process.env.NODE_ENV !== 'production';

module.exports = {
  sourceMap: development,
  plugins: [
    rucksack(),
    autoprefixer({
      browsers: ['last 2 versions', 'Firefox ESR', '> 1%', 'ie >= 9', 'iOS >= 8', 'Android >= 4']
    })
  ]
};
