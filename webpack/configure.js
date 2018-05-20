/**
 * @module configure
 * @listens MIT
 * @author nuintun
 * @description Paths configure.
 */

'use strict';

const path = require('path');

module.exports = {
  entry: 'Assets/src/js/pages/**/*.jsx',
  entryBasePath: 'Assets/src/js/pages',
  publicPath: '/Assets/dist/',
  context: path.resolve('Assets/src'),
  outputPath: path.resolve('Assets/dist'),
  alias: {
    '~': path.resolve('Assets/src'),
    '~js': path.resolve('Assets/src/js'),
    '~css': path.resolve('Assets/src/css'),
    '~fonts': path.resolve('Assets/src/fonts'),
    '~images': path.resolve('Assets/src/images')
  },
  modules: [path.resolve('Assets/src'), path.resolve('node_modules')]
};
