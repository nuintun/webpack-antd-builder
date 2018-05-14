/**
 * @module paths
 * @author nuintun
 */

'use strict';

const path = require('path');

module.exports = {
  entry: 'Assets/src/js/pages/**/*.jsx',
  entryBase: 'Assets/src/js',
  publicPath: '/Assets/dist/',
  distPath: path.resolve('Assets/dist'),
  context: path.resolve('Assets/src'),
  alias: {
    '~': path.resolve('Assets/src'),
    '~js': path.resolve('Assets/src/js'),
    '~css': path.resolve('Assets/src/css'),
    '~fonts': path.resolve('Assets/src/fonts'),
    '~images': path.resolve('Assets/src/images')
  },
  copyConfigure: [
    { from: 'Assets/src/fonts/', to: 'fonts/', toType: 'dir' },
    { from: 'Assets/src/images/', to: 'images/', toType: 'dir' }
  ]
};
