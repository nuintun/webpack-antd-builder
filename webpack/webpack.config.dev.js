/**
 * @module webpack.config.dev
 * @author nuintun
 */

'use strict';

const path = require('path');
const configure = require('./webpack.config.base');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

configure.mode = 'development';
configure.devtool = 'eval';
configure.output = {
  publicPath: '/Assets/dist/',
  filename: 'js/[name].js',
  chunkFilename: 'js/[name].js',
  path: path.resolve('Assets/dist')
};
configure.plugins.push(new MiniCssExtractPlugin({ filename: 'css/[name].css' }));
configure.watchOptions = { ignored: 'node_modules/**/*' };

module.exports = configure;
