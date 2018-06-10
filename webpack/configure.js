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
  node: {
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
    dns: 'empty',
    repl: 'empty',
    dgram: 'empty',
    module: 'empty',
    cluster: 'empty',
    readline: 'empty',
    child_process: 'empty'
  },
  stats: {
    cached: false,
    cachedAssets: false,
    children: false,
    chunks: false,
    chunkModules: false,
    chunkOrigins: false,
    entrypoints: false,
    modules: false,
    moduleTrace: false,
    publicPath: false,
    reasons: false,
    source: false,
    timings: false
  },
  performance: {
    hints: false
  },
  modules: [path.resolve('Assets/src'), path.resolve('node_modules')],
  noParse: [/[\\/]node_modules[\\/]moment[\\/]/i, /[\\/]node_modules[\\/]@nuintun[\\/](fetch|promise)[\\/]/i]
};
