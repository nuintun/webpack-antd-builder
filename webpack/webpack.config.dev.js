/**
 * @module webpack.config.dev
 * @author nuintun
 */

'use strict';

const path = require('path');
const webpack = require('webpack');
const configure = require('./webpack.config.base');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

configure.mode = 'development';
configure.devtool = 'none';
configure.output = {
  publicPath: '/Assets/dist/',
  filename: 'js/[name].js',
  chunkFilename: 'js/[name].js',
  path: path.resolve('Assets/dist')
};
configure.plugins.push(
  new webpack.SourceMapDevToolPlugin({
    module: true,
    filename: '[file].map',
    exclude: /[\\/](?:react|antd|vendors|runtime)\.(?:js|css)$/i
  }),
  new MiniCssExtractPlugin({ filename: 'css/[name].css' })
);
configure.watchOptions = { ignored: 'node_modules/**/*' };

module.exports = configure;
